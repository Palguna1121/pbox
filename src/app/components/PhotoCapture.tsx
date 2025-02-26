"use client";

import React, { useRef, useState, useEffect } from "react";
import { upscaleWithRealESRGAN } from "@/lib/python-bridge";

// Tipe filter yang tersedia
type FilterType = "normal" | "grayscale" | "sepia" | "vintage";

interface PhotoCaptureProps {
  onCapture?: (imageUrl: string) => void;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("normal");
  const [error, setError] = useState<string | null>(null);

  // Meminta akses kamera
  const startCamera = async () => {
    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(userMedia);

      if (videoRef.current) {
        videoRef.current.srcObject = userMedia;
      }

      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Gagal mengakses kamera. Pastikan kamu mengizinkan akses kamera.");
    }
  };

  // Menghentikan stream kamera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Membersihkan resources saat komponen unmount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Menerapkan filter ke canvas
  const applyFilter = (ctx: CanvasRenderingContext2D, filter: FilterType) => {
    switch (filter) {
      case "grayscale":
        ctx.filter = "grayscale(1)";
        break;
      case "sepia":
        ctx.filter = "sepia(0.8)";
        break;
      case "vintage":
        ctx.filter = "contrast(1.1) brightness(1.1) sepia(0.3)";
        break;
      default:
        ctx.filter = "none";
    }
  };

  // Mengambil foto dari video
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Set dimensi canvas sesuai video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Terapkan filter yang dipilih
        applyFilter(ctx, filter);

        // Gambar frame video ke canvas
        ctx.drawImage(video, 0, 0);

        // Dapatkan URL data dari canvas
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(dataUrl);
        setUpscaledImage(null);
      }
    }
  };

  // Proses gambar yang diambil dengan AI upscaling
  const processImage = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);

    try {
      // Dapatkan data base64 (tanpa prefix data:image/jpeg;base64,)
      const base64Data = capturedImage.split(",")[1];

      const result = await upscaleWithRealESRGAN(base64Data);

      if (result.success && result.imageData) {
        setUpscaledImage(result.imageData);

        // Simpan ke sessionStorage untuk kecepatan akses
        sessionStorage.setItem("lastUpscaledImage", result.imageData);

        if (onCapture) {
          onCapture(result.imageData);
        }
      } else {
        setError(`Upscaling gagal: ${result.message}`);
      }
    } catch (err) {
      console.error("Error during image processing:", err);
      setError("Terjadi kesalahan saat memproses gambar.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset semua dan mulai ulang
  const resetCapture = () => {
    setCapturedImage(null);
    setUpscaledImage(null);
    setError(null);
    startCamera();
  };

  // Cek apakah ada upscaled image di session storage saat pertama load
  useEffect(() => {
    const savedImage = sessionStorage.getItem("lastUpscaledImage");
    if (savedImage) {
      setUpscaledImage(savedImage);
    }
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {error && <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Preview Kamera atau Gambar yang Diambil */}
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
        {!capturedImage && !upscaledImage && <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />}

        {capturedImage && !upscaledImage && <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />}

        {upscaledImage && <img src={upscaledImage} alt="Upscaled Photo" className="w-full h-full object-contain" />}

        {/* Canvas tersembunyi untuk capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay loading */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin h-10 w-10 mx-auto mb-2 border-4 border-white border-t-transparent rounded-full"></div>
              <p>Mengolah gambar dengan AI...</p>
            </div>
          </div>
        )}
      </div>

      {/* Filter Selection */}
      {!capturedImage && !upscaledImage && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {(["normal", "grayscale", "sepia", "vintage"] as FilterType[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded ${filter === f ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Tombol Aksi */}
      <div className="flex gap-3 mt-2">
        {!capturedImage && !upscaledImage ? (
          <button onClick={capturePhoto} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition" disabled={!stream}>
            Ambil Foto
          </button>
        ) : !upscaledImage ? (
          <>
            <button onClick={resetCapture} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
              Ambil Ulang
            </button>
            <button onClick={processImage} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition" disabled={isProcessing}>
              Proses dengan AI
            </button>
          </>
        ) : (
          <>
            <button onClick={resetCapture} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
              Ambil Foto Baru
            </button>
            <button onClick={() => onCapture && upscaledImage && onCapture(upscaledImage)} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
              Gunakan Foto Ini
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PhotoCapture;
