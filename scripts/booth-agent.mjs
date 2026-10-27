#!/usr/bin/env node
// PBOX booth agent: a small local HTTP bridge between the web app and booth hardware.
//
// Camera: gphoto2 (libgphoto2) for USB DSLR/mirrorless bodies.
//   gphoto2 --auto-detect                                  list cameras
//   gphoto2 --capture-preview --stdout                     one live-view JPEG frame
//   gphoto2 --capture-image-and-download --stdout          full capture as JPEG
// Printer: CUPS.
//   lpstat -d / lpstat -p <printer>                        default printer and state
//   lp -d <printer> -n <copies> -o media=<m> -o fit-to-page <file>
// Windows booths can run digiCamControl's webserver instead; point BOOTH_AGENT_URL
// at an adapter that exposes the same endpoints.
//
// Untested on real hardware. BOOTH_SIMULATE=1 serves a sample image and spools prints to disk.
//
// Env: BOOTH_AGENT_PORT (7788), BOOTH_AGENT_HOST (127.0.0.1), BOOTH_AGENT_TOKEN,
//      BOOTH_SIMULATE, BOOTH_PRINTER, STORAGE_DIR.

import { execFile } from "node:child_process";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.BOOTH_AGENT_PORT || 7788);
const HOST = process.env.BOOTH_AGENT_HOST || "127.0.0.1";
const TOKEN = process.env.BOOTH_AGENT_TOKEN || "";
const SIMULATE = ["1", "true", "yes"].includes(String(process.env.BOOTH_SIMULATE || "").toLowerCase());
const PRINTER = process.env.BOOTH_PRINTER || "";
const STORAGE_DIR = path.resolve(process.env.STORAGE_DIR || path.join(ROOT, "storage"));
const SAMPLE_IMAGE = path.join(ROOT, "public/images/pbox-hero.webp");
const MAX_PRINT_BYTES = 30 * 1024 * 1024;

function run(cmd, args, { timeout = 15000, binary = false } = {}) {
  return new Promise((resolve, reject) => {
    execFile(
      cmd,
      args,
      { timeout, maxBuffer: 64 * 1024 * 1024, encoding: binary ? "buffer" : "utf8", windowsHide: true },
      (error, stdout, stderr) => {
        if (error) {
          error.stderr = String(stderr || "").trim();
          reject(error);
        } else resolve(stdout);
      },
    );
  });
}

// gphoto2 holds the USB device exclusively, so camera calls run one at a time.
let cameraQueue = Promise.resolve();
function withCamera(task) {
  const next = cameraQueue.then(task, task);
  cameraQueue = next.catch(() => {});
  return next;
}

function sniffImage(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8) return { ext: "jpg", type: "image/jpeg" };
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return { ext: "png", type: "image/png" };
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP")
    return { ext: "webp", type: "image/webp" };
  return null;
}

async function cameraStatus() {
  if (SIMULATE) return { connected: true, model: "Kamera simulasi" };
  try {
    const out = await run("gphoto2", ["--auto-detect"], { timeout: 8000 });
    // Output: header "Model  Port", a dashed line, then one row per camera.
    const rows = out
      .split("\n")
      .slice(2)
      .map((line) => line.trim())
      .filter(Boolean);
    if (rows.length === 0) return { connected: false, model: null };
    const model = rows[0].replace(/\s{2,}\S+$/, "").trim();
    return { connected: true, model };
  } catch (error) {
    return { connected: false, model: null, error: error.code === "ENOENT" ? "gphoto2 tidak terpasang" : error.stderr || error.message };
  }
}

async function resolvePrinter() {
  if (PRINTER) return PRINTER;
  try {
    const out = await run("lpstat", ["-d"], { timeout: 5000 });
    const match = /destination:\s*(\S+)/.exec(out);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function printerStatus() {
  if (SIMULATE) return { name: "Printer simulasi", ready: true };
  const name = await resolvePrinter();
  if (!name) return { name: null, ready: false, error: "Tidak ada printer CUPS default" };
  try {
    const out = await run("lpstat", ["-p", name], { timeout: 5000 });
    const ready = /\bis (idle|printing)\b/.test(out) && !/disabled/i.test(out);
    return { name, ready, state: out.trim().split("\n")[0] };
  } catch (error) {
    return { name, ready: false, error: error.code === "ENOENT" ? "CUPS tidak terpasang" : error.stderr || error.message };
  }
}

async function captureFrame(kind) {
  if (SIMULATE) return { data: await readFile(SAMPLE_IMAGE), type: "image/webp" };
  const args =
    kind === "preview"
      ? ["--capture-preview", "--stdout"]
      : ["--capture-image-and-download", "--stdout"];
  const data = await withCamera(() => run("gphoto2", args, { timeout: kind === "preview" ? 10000 : 30000, binary: true }));
  const sniffed = sniffImage(data);
  if (!sniffed) throw new Error("Kamera tidak mengembalikan gambar JPEG");
  return { data, type: sniffed.type };
}

async function printImage(body, { copies, media }) {
  const image = sniffImage(body);
  if (!image) throw Object.assign(new Error("Body harus gambar JPEG, PNG, atau WebP"), { status: 415 });

  if (SIMULATE) {
    const spool = path.join(STORAGE_DIR, "print-spool");
    await mkdir(spool, { recursive: true });
    const job = `sim-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
    await writeFile(path.join(spool, `${job}.${image.ext}`), body);
    await writeFile(path.join(spool, `${job}.json`), JSON.stringify({ job, copies, media, at: new Date().toISOString() }));
    return { ok: true, job, simulated: true };
  }

  const printer = await resolvePrinter();
  if (!printer) throw Object.assign(new Error("Tidak ada printer CUPS"), { status: 503 });
  const tmp = path.join(os.tmpdir(), `pbox-print-${randomBytes(6).toString("hex")}.${image.ext}`);
  await writeFile(tmp, body);
  try {
    const args = ["-d", printer, "-n", String(copies), "-o", "fit-to-page"];
    if (media) args.push("-o", `media=${media}`);
    args.push(tmp);
    const out = await run("lp", args, { timeout: 20000 });
    const match = /request id is (\S+)/.exec(out);
    return { ok: true, job: match ? match[1] : out.trim() };
  } finally {
    // CUPS copies the file into its spool when `lp` returns.
    await rm(tmp, { force: true });
  }
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error("Body terlalu besar"), { status: 413 }));
        req.destroy();
      } else chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function tokenOk(req) {
  if (!TOKEN) return true;
  const given = Buffer.from(String(req.headers["x-booth-token"] || ""));
  const expected = Buffer.from(TOKEN);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

function sendImage(res, { data, type }) {
  res.writeHead(200, { "Content-Type": type, "Content-Length": data.length, "Cache-Control": "no-store" });
  res.end(data);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  try {
    if (!tokenOk(req)) return sendJson(res, 401, { error: "Token booth salah" });

    if (req.method === "GET" && url.pathname === "/status") {
      const [camera, printer] = await Promise.all([cameraStatus(), printerStatus()]);
      return sendJson(res, 200, { camera, printer, simulate: SIMULATE });
    }
    if (req.method === "GET" && url.pathname === "/preview") return sendImage(res, await captureFrame("preview"));
    if (req.method === "POST" && url.pathname === "/capture") return sendImage(res, await captureFrame("capture"));
    if (req.method === "POST" && url.pathname === "/print") {
      const copies = Math.min(20, Math.max(1, Number.parseInt(url.searchParams.get("copies") || "1", 10) || 1));
      const mediaParam = url.searchParams.get("media") || "";
      if (mediaParam && !/^[A-Za-z0-9_.\-]{1,64}$/.test(mediaParam)) {
        return sendJson(res, 400, { error: "Nilai media tidak valid" });
      }
      const body = await readBody(req, MAX_PRINT_BYTES);
      return sendJson(res, 200, await printImage(body, { copies, media: mediaParam || null }));
    }
    return sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    console.error(`[booth-agent] ${req.method} ${url.pathname}:`, error.stderr || error.message);
    if (!res.headersSent) sendJson(res, error.status || 502, { error: error.stderr || error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[booth-agent] listening on http://${HOST}:${PORT}${SIMULATE ? " (simulasi)" : ""}${TOKEN ? " with token" : ""}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
