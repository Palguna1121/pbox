import { Aperture, Image as ImageIcon, Save } from "lucide-react";
import { MotionReveal } from "@/components/MotionReveal";

const STEPS = [
  {
    title: "Pilih layanan",
    description: "Cari frame, stiker, atau latar formal yang cocok untuk fotomu.",
    icon: ImageIcon,
  },
  {
    title: "Ambil foto",
    description: "Izinkan akses kamera, lalu ambil gambar langsung di browser.",
    icon: Aperture,
  },
  {
    title: "Atur hasil",
    description: "Sesuaikan hasil di editor, lalu pilih simpan saat sudah cocok.",
    icon: Save,
  },
];

export function HowItWorks() {
  return (
    <section className="bg-muted/55 px-4 py-20 sm:px-6 lg:py-28" aria-labelledby="cara-kerja-title">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <MotionReveal>
          <h2 id="cara-kerja-title" className="max-w-[12ch] text-balance text-4xl font-black leading-tight tracking-tighter sm:text-5xl">
            Dari kamera ke hasil yang kamu suka.
          </h2>
          <p className="mt-5 max-w-[43ch] text-base leading-relaxed text-muted-foreground">
            Mulai dari katalog, lanjutkan di kamera, lalu atur hasilnya sendiri.
          </p>
        </MotionReveal>

        <div className="border-t border-border">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <MotionReveal key={step.title} delay={index * 0.07}>
                <div className="grid grid-cols-[3rem_1fr] gap-5 border-b border-border py-7 sm:grid-cols-[4rem_1fr] sm:gap-7">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-background text-primary" aria-hidden="true">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
                    <p className="mt-2 max-w-[45ch] text-sm leading-relaxed text-muted-foreground sm:text-base">{step.description}</p>
                  </div>
                </div>
              </MotionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
