import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = `${site.name}: ${site.tagline}`;

const BG = "#0b0820";
const COIN = "#ffd23f";
const PINK = "#ff3d7f";
const CYAN = "#3ef0ff";

/** Shared 1200×630 social card. satori needs woff/ttf, so the woff file is read directly. */
export async function renderOgCard() {
  const font = await readFile(
    path.join(process.cwd(), "node_modules/@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: BG,
          backgroundImage:
            "linear-gradient(rgba(62,240,255,0.10) 2px, transparent 2px), linear-gradient(90deg, rgba(62,240,255,0.10) 2px, transparent 2px)",
          backgroundSize: "40px 40px",
          fontFamily: "PressStart2P",
          color: "#f5efe0",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, color: CYAN, letterSpacing: 4, marginBottom: 36 }}>INSERT COIN</div>
        <div
          style={{
            display: "flex",
            fontSize: 168,
            color: COIN,
            textShadow: `10px 10px 0 ${PINK}`,
            letterSpacing: 6,
          }}
        >
          PBOX
        </div>
        <div style={{ display: "flex", marginTop: 52, fontSize: 30, color: "#f5efe0" }}>{site.tagline}</div>
        <div style={{ display: "flex", gap: 16, marginTop: 48 }}>
          {[PINK, COIN, CYAN, "#9cff3a"].map((color) => (
            <div key={color} style={{ width: 28, height: 28, backgroundColor: color, border: "4px solid #000" }} />
          ))}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "PressStart2P", data: font, style: "normal", weight: 400 }],
    },
  );
}
