// src/app/api/upscale/route.ts
import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { Readable } from "stream";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData } = body;

    if (!imageData) {
      return NextResponse.json({ success: false, message: "No image data provided" }, { status: 400 });
    }

    const pythonScriptPath = path.join(process.cwd(), "python", "upscaler.py");

    // Membuat stream dari base64 data
    const inputStream = new Readable();
    inputStream.push(imageData);
    inputStream.push(null); // Tanda akhir stream

    // Menggunakan spawn untuk proses I/O yang lebih baik
    const pythonProcess = spawn("python", [pythonScriptPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    // Pipe input ke stdin proses Python
    inputStream.pipe(pythonProcess.stdin);

    // Tangkap output stdout
    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    // Tangkap error stderr
    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    // Tunggu proses selesai
    const exitCode = await new Promise<number>((resolve) => {
      pythonProcess.on("close", resolve);
    });

    if (exitCode !== 0 || stderr) {
      console.error("Python script error:", stderr);
      return NextResponse.json({ success: false, message: `Error in Python script: ${stderr}` }, { status: 500 });
    }

    const upscaledBase64 = stdout.trim();

    return NextResponse.json({
      success: true,
      imageData: `data:image/jpeg;base64,${upscaledBase64}`,
    });
  } catch (error) {
    console.error("Upscaling error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error during upscaling",
      },
      { status: 500 }
    );
  }
}
