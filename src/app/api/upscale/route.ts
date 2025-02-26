// src/app/api/upscale/route.ts
import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

// Promisify exec untuk async/await
const execPromise = promisify(exec);

// Ukuran maksimal body request
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { imageData } = body;

    if (!imageData) {
      return NextResponse.json({ success: false, message: "No image data provided" }, { status: 400 });
    }

    // Path ke Python script
    const pythonScriptPath = path.join(process.cwd(), "python", "upscaler.py");

    // Command untuk menjalankan Python script
    // Pastikan python/pip sudah terinstall dependencies yang diperlukan:
    // pip install torch numpy pillow basicsr realesrgan
    const command = `python ${pythonScriptPath}`;

    // Jalankan Python script dengan input base64 dari stdin
    const { stdout, stderr } = await execPromise(command, {
      input: imageData,
      maxBuffer: 1024 * 1024 * 50, // Perbesar buffer untuk gambar besar
    });

    if (stderr) {
      console.error("Python script error:", stderr);
      return NextResponse.json({ success: false, message: `Error in Python script: ${stderr}` }, { status: 500 });
    }

    // Output dari Python script adalah base64 dari gambar yang sudah di-upscale
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
