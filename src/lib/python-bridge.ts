// src/lib/python-bridge.ts
import axios from "axios";

interface UpscaleResult {
  success: boolean;
  message?: string;
  imageData?: string;
}

/**
 * Upscale gambar menggunakan RealESRGAN melalui API
 * @param imageBase64 - Base64 dari gambar (tanpa prefix data:image)
 * @returns Promise dengan hasil upscaling
 */
export const upscaleWithRealESRGAN = async (imageBase64: string): Promise<UpscaleResult> => {
  try {
    const response = await axios.post(
      "/api/upscale",
      {
        imageData: imageBase64,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000, // 60 detik timeout (upscaling bisa memakan waktu)
      }
    );

    if (response.data.success) {
      return {
        success: true,
        imageData: response.data.imageData,
      };
    } else {
      throw new Error(response.data.message || "Unknown error");
    }
  } catch (error) {
    console.error("Error upscaling image:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to upscale image",
    };
  }
};
