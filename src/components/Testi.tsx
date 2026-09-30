"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TESTIMONIALS = [
  { name: "Rina S.", role: "Content Creator", text: "Frame-nya keren banget! Foto aku jadi jauh lebih estetik buat konten Instagram.", rating: 5 },
  { name: "Dimas P.", role: "Mahasiswa", text: "Foto formal untuk CPNS jadi gampang banget. Background biru mudanya bagus!", rating: 5 },
  { name: "Aulia F.", role: "Fotografer", text: "Fitur sticker-nya seru! Anak-anak suka banget buat foto bareng keluarga.", rating: 5 },
  { name: "Bagas W.", role: "Pelajar", text: "Gampang dipakai, hasilnya langsung bisa download. Recommended banget!", rating: 5 },
  { name: "Sari N.", role: "Ibu Rumah Tangga", text: "Dipakai buat foto kenang-kenangan wisuda, hasilnya bagus dan cepat!", rating: 5 },
  { name: "Kevin T.", role: "Designer", text: "UI-nya clean dan modern. Frame Geometric Bold jadi favorit aku.", rating: 5 },
];

export const Testi = () => (
  <section className="w-full py-16 bg-muted/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-10">
        <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Testimoni</p>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tighter">
          Kata Mereka <span className="text-primary">:)</span>
        </h2>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm sm:text-base">
          Ribuan pengguna sudah mencoba dan puas dengan hasil foto mereka.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="bg-card rounded-3xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: t.rating }).map((_, j) => (
                <span key={j} className="text-primary text-base">★</span>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-foreground/80 mb-5">&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
