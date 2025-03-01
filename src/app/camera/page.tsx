"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

type OverlayType = "frame" | "sticker" | "formal";

export default function CameraPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as OverlayType;
  const id = searchParams.get("id");
  const color = searchParams.get("color");

  const [overlay, setOverlay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverlay = async () => {
      try {
        if (type === "formal") {
          setOverlay({ type: "color", value: color });
        } else if (id) {
          const endpoint = type === "frame" ? `/api/frame-catalog/${id}` : `/api/sticker-catalog/${id}`;

          const response = await fetch(endpoint);
          const data = await response.json();
          setOverlay(data);
        }
      } catch (error) {
        console.error("Error fetching overlay:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverlay();
  }, [type, id, color]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  const getHeaderText = () => {
    switch (type) {
      case "frame":
        return overlay?.frameName;
      case "sticker":
        return overlay?.stickerName;
      case "formal":
        return `Background ${overlay?.value}`;
      default:
        return "Kamera";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{getHeaderText()}</h1>

      {/* Area Kamera dengan Overlay */}
      <div className="relative aspect-video border-2 rounded-lg overflow-hidden">
        {/* Preview Kamera */}
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-muted-foreground">Preview Kamera (Dalam Pengembangan)</span>
        </div>

        {/* Overlay */}
        {overlay && (
          <div className="absolute inset-0">
            {type === "formal" ? (
              <div className="absolute inset-0" style={{ backgroundColor: overlay.value }} />
            ) : (
              <img
                src={overlay.imageUrl}
                alt={overlay.frameName || overlay.stickerName}
                className={cn("absolute inset-0 object-contain", type === "sticker" ? "w-32 h-32" : "w-full h-full")}
                style={{
                  pointerEvents: "none",
                  ...(type === "sticker" && {
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }),
                }}
              />
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href={type === "frame" ? "/photobox" : type === "sticker" ? "/sticker-pic" : "/formal-pic"}>Ganti {type === "formal" ? "Background" : type}</Link>
        </Button>
        <Button>Ambil Foto</Button>
      </div>
    </div>
  );
}
