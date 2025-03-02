// src/components/camera/Camera.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface CameraProps {
  onCapture: (imageSrc: string) => void;
  countdown?: number;
  className?: string;
}

export function Camera({ onCapture, countdown = 5, className }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [timer, setTimer] = useState(countdown);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Initialize camera
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasPermission(false);
        toast({
          title: "Kamera Dinonaktifkan!",
          description: "Oops kamera tidak diizinkan bro! Mohon aktifkan izin kamera untuk melanjutkan.",
          variant: "destructive",
        });
      }
    };

    setupCamera();

    // Cleanup function
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [toast]);

  // Countdown timer
  useEffect(() => {
    if (!isCountingDown) return;

    if (timer <= 0) {
      capturePhoto();
      setIsCountingDown(false);
      setTimer(countdown);
      return;
    }

    const intervalId = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isCountingDown, timer, countdown]);

  const startCountdown = () => {
    if (!hasPermission) return;
    setIsCountingDown(true);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageSrc = canvas.toDataURL("image/png");
    onCapture(imageSrc);
  };

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-md bg-background">
        <span className="text-muted-foreground text-lg mb-4">Kamera Dinonaktifkan!</span>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md" />
      <canvas ref={canvasRef} className="hidden" />

      {isCountingDown && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
          <span className="text-white text-8xl font-bold">{timer}</span>
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <Button onClick={startCountdown} disabled={isCountingDown || !hasPermission} size="lg" className="font-semibold">
          {isCountingDown ? "Mempersiapkan..." : "Mulai Sesi Foto"}
        </Button>
      </div>
    </div>
  );
}
