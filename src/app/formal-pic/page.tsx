import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const backgrounds = [
  { name: "Putih", color: "#ffffff" },
  { name: "Merah", color: "#ff0000" },
  { name: "Biru", color: "#0000ff" },
  { name: "Hijau", color: "#00ff00" },
];

export default function FormalPhotoPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Pilih Background Formal</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {backgrounds.map((bg, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="h-48 w-full" style={{ backgroundColor: bg.color }} />
            <div className="p-4">
              <h3 className="font-semibold">{bg.name}</h3>
              <div className="mt-4 flex justify-end">
                <Link href={`/camera?type=formal&color=${encodeURIComponent(bg.color)}`}>
                  <Button variant="default">Pilih</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
