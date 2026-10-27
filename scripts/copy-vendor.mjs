// Copies MediaPipe WASM runtime into public/ so background removal works offline (booth mode).
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const src = join(process.cwd(), "node_modules/@mediapipe/tasks-vision/wasm");
const dest = join(process.cwd(), "public/vendor/mediapipe");

if (existsSync(src)) {
  mkdirSync(dest, { recursive: true });
  for (const name of [
    "vision_wasm_internal.js",
    "vision_wasm_internal.wasm",
    "vision_wasm_nosimd_internal.js",
    "vision_wasm_nosimd_internal.wasm",
  ]) {
    cpSync(join(src, name), join(dest, name));
  }
  console.log("mediapipe wasm copied to public/vendor/mediapipe");
}
