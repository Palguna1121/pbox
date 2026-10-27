import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Brush, Camera, Frame, Layers, Printer, QrCode, SlidersHorizontal, Sticker, Type, Undo2, Usb, Wand2 } from "lucide-react";
import { Marquee } from "@/components/motion/marquee";
import { BouncyAccordion } from "@/components/motion/bouncy-accordion";
import { MotionReveal } from "@/components/MotionReveal";
import { Button } from "@/components/ui/button";

export const FAQ = [
  {
    q: "Apakah PBOX perlu instal aplikasi?",
    a: "Tidak. PBOX berjalan di browser modern seperti Chrome, Edge, Firefox, dan Safari. Kamera hanya bisa dipakai lewat HTTPS atau localhost.",
  },
  {
    q: "Apakah harus punya akun untuk foto?",
    a: "Tidak. Foto bisa diambil, diedit, disimpan, dan dibagikan tanpa akun. Kalau masuk, hasil foto tercatat di dashboard supaya bisa dibuka atau dihapus lagi nanti.",
  },
  {
    q: "Siapa yang bisa melihat foto saya?",
    a: "Setiap foto tersimpan punya tautan share acak. Siapa pun yang memegang tautan itu bisa melihatnya, tapi halaman share tidak diindeks mesin pencari. Pemilik akun bisa menghapus fotonya dari dashboard.",
  },
  {
    q: "Kamera apa saja yang bisa dipakai?",
    a: "Webcam laptop, webcam USB, capture card HDMI, dan kamera mirrorless yang punya mode webcam (UVC). Untuk DSLR di booth, PBOX menyediakan agen lokal berbasis gphoto2 yang masih eksperimental.",
  },
  {
    q: "Bagaimana cara mencetak hasil foto?",
    a: "Tombol Cetak menyiapkan lembar 4R, strip 2×6, A6, atau pas foto 2×3, 3×4, dan 4×6 cm yang disusun di kertas 4R, lalu membuka dialog cetak browser. Untuk booth tanpa dialog, jalankan Chrome dengan mode kiosk printing atau pakai agen booth yang mengirim ke CUPS.",
  },
  {
    q: "Bisa ganti warna latar pas foto?",
    a: "Bisa. Mode Foto Formal punya pilihan merah, biru, putih, dan abu-abu, plus tombol hapus latar yang memisahkan orang dari latar kamera langsung di perangkatmu. Hasil terbaik dengan latar polos dan cahaya rata.",
  },
];

const MODES = [
  {
    no: "01",
    title: "Photobox",
    href: "/photobox",
    desc: "Frame dengan 1, 2, atau 4 slot. Kamera mengambil jepretan sesuai jumlah slot, lalu tiap foto bisa digeser dan di-zoom di dalam slotnya.",
    tag: "Strip & kolase",
    image: "/images/frames/frame-film-90an.png",
    frame: true,
  },
  {
    no: "02",
    title: "Sticker Pic",
    href: "/sticker-pic",
    desc: "Satu foto, stiker sebanyak yang kamu mau. Potong ke 1:1, 4:5, atau 9:16 supaya pas untuk feed dan story.",
    tag: "Feed & story",
    image: "/images/stickers/kawaii-cat.png",
    frame: false,
  },
  {
    no: "03",
    title: "Foto Formal",
    href: "/formal-pic",
    desc: "Pas foto 2×3, 3×4, 4×6 cm, atau ukuran paspor. Ganti warna latar dan cetak beberapa lembar sekaligus di kertas 4R.",
    tag: "Dokumen",
    image: "/images/formal/background-biru-tua.png",
    frame: false,
  },
];

const STEPS = [
  { level: "Level 1", title: "Pilih mode", desc: "Frame, stiker, atau pas foto. Pilihan frame menentukan jumlah jepretan.", icon: Frame },
  { level: "Level 2", title: "Foto", desc: "Hitung mundur 3, 5, atau 10 detik. Jepretan yang meleset bisa diulang satu per satu.", icon: Camera },
  { level: "Level 3", title: "Edit", desc: "Filter, stiker, teks, kuas, dan layer. Ada undo, jadi coba-coba saja.", icon: SlidersHorizontal },
  { level: "Level 4", title: "Bawa pulang", desc: "Unduh PNG, bagikan tautan dan QR, atau cetak dari browser.", icon: Printer },
];

const FEATURES = [
  { icon: SlidersHorizontal, title: "10 preset filter", desc: "Arcade, Game Boy, CRT, Vapor, Mono, Sepia, Vintage, dan lainnya, plus 7 slider manual." },
  { icon: Sticker, title: "Stiker katalog & PNG sendiri", desc: "Tarik, putar, ubah ukuran, duplikat. Unggah PNG transparan kalau mau stiker sendiri." },
  { icon: Type, title: "Teks pixel", desc: "Press Start 2P, Pixelify, VT323, atau Geist. Garis tepi gelap supaya terbaca di atas foto." },
  { icon: Brush, title: "Kuas bebas", desc: "Coret-coret di atas foto dengan warna dan ketebalan pilihanmu." },
  { icon: Layers, title: "Panel layer", desc: "Sembunyikan, kunci, dan atur urutan objek. Bisa dipakai penuh dengan keyboard." },
  { icon: Undo2, title: "Undo tanpa takut", desc: "Riwayat 60 langkah. Ctrl+Z, Ctrl+Shift+Z, panah untuk geser, Delete untuk hapus." },
  { icon: Wand2, title: "Hapus latar", desc: "Segmentasi orang berjalan di perangkatmu, tanpa mengunggah foto ke layanan lain." },
  { icon: QrCode, title: "QR unduh", desc: "Halaman share punya QR, jadi tamu booth tinggal pindai dari HP." },
];

export function HowItWorks() {
  return (
    <>
      <div className="border-b-2 border-border bg-primary py-3 text-primary-foreground" aria-hidden>
        <Marquee speed={40} fade={false} gap="2.5rem">
          {["Frame", "Stiker", "Teks pixel", "Filter Game Boy", "Hapus latar", "Cetak 4R", "QR unduh", "Undo 60x"].map((t) => (
            <span key={t} className="font-pixel flex items-center gap-10 whitespace-nowrap text-[0.65rem] uppercase">
              {t} <span>★</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* Mode select */}
      <section id="mode" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <MotionReveal>
          <p className="font-pixel text-[0.6rem] uppercase text-primary">Select mode</p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">Tiga cartridge, satu studio.</h2>
        </MotionReveal>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {MODES.map((m, i) => (
            <MotionReveal key={m.href} delay={i * 0.06}>
              <li className="h-full">
                <Link
                  href={m.href}
                  className="group flex h-full flex-col overflow-hidden rounded-md border-2 border-border bg-card shadow-arcade transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-primary"
                >
                  <div className="flex items-center justify-between border-b-2 border-border bg-muted px-4 py-2">
                    <span className="font-mono text-2xl leading-none text-muted-foreground">{m.no}</span>
                    <span className="font-pixel text-[0.5rem] uppercase text-neon-cyan">{m.tag}</span>
                  </div>
                  <div className={m.frame ? "frame-preview relative aspect-[4/3]" : "relative grid aspect-[4/3] place-items-center bg-[#1c1740]"}>
                    <Image
                      src={m.image}
                      alt=""
                      fill={m.frame}
                      width={m.frame ? undefined : 200}
                      height={m.frame ? undefined : 200}
                      sizes={m.frame ? "(min-width: 768px) 33vw, 100vw" : undefined}
                      className={m.frame ? "object-contain" : "size-40 object-contain drop-shadow-[4px_4px_0_#000] transition-transform group-hover:-rotate-6"}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-2xl font-bold">{m.title}</h3>
                    <p className="mt-2 flex-1 text-muted-foreground">{m.desc}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                      Pilih mode <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </div>
                </Link>
              </li>
            </MotionReveal>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section id="cara-kerja" className="border-y-2 border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <MotionReveal>
            <p className="font-pixel text-[0.6rem] uppercase text-primary">How to play</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">Empat level, kurang dari dua menit.</h2>
          </MotionReveal>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <MotionReveal key={s.title} delay={i * 0.05}>
                <li className="arcade-panel h-full p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-[0.55rem] uppercase text-neon-cyan">{s.level}</span>
                    <s.icon className="size-5 text-primary" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground">{s.desc}</p>
                </li>
              </MotionReveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Editor features */}
      <section id="editor" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <MotionReveal>
            <p className="font-pixel text-[0.6rem] uppercase text-primary">Power-ups</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">Editor yang beneran bisa ngedit.</h2>
            <p className="mt-4 max-w-[48ch] text-muted-foreground">
              Semua edit berjalan di browser dengan kanvas berlapis. Hasil diekspor sampai sekitar 2400 px di sisi panjang, cukup tajam untuk cetak 4R.
            </p>
            <Button asChild className="mt-8">
              <Link href="/camera?type=sticker">Coba editor</Link>
            </Button>
          </MotionReveal>
          <ul className="grid gap-px overflow-hidden rounded-md border-2 border-border bg-border sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f.title} className="bg-background p-5">
                <f.icon className="size-5 text-neon-pink" aria-hidden />
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Booth */}
      <section id="booth" className="border-y-2 border-border bg-[#0b0820] text-[#f5efe0]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <MotionReveal>
            <p className="font-pixel text-[0.6rem] uppercase text-[#3ef0ff]">2 player · event mode</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl">Pasang di booth event.</h2>
            <p className="mt-4 max-w-[52ch] text-[#b0a9cf]">
              Satu laptop, satu kamera, satu printer. PBOX membaca kamera yang terdeteksi browser dan menyiapkan lembar cetak dengan ukuran kertas yang benar.
            </p>
            <p className="mt-4 max-w-[52ch] border-l-4 border-[#ffd23f] pl-4 text-sm text-[#b0a9cf]">
              Dukungan DSLR dan cetak langsung tanpa dialog memakai agen lokal (gphoto2 + CUPS). Bagian ini belum diuji pada perangkat fisik, jadi coba dulu sebelum hari H.
            </p>
          </MotionReveal>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Usb, title: "Webcam & capture card", desc: "Pilih perangkat, resolusi sampai 4K, mode cermin, dan durasi hitung mundur." },
              { icon: Camera, title: "DSLR via agen booth", desc: "Live view dan jepret lewat gphoto2. Ada mode simulasi untuk latihan tanpa kamera." },
              { icon: Printer, title: "Cetak 4R, strip, pas foto", desc: "Lembar disusun otomatis dengan garis potong. Mode kiosk Chrome melewati dialog." },
              { icon: QrCode, title: "QR untuk tamu", desc: "Tamu memindai QR di layar hasil untuk mengunduh fotonya sendiri." },
            ].map((b) => (
              <li key={b.title} className="rounded-md border-2 border-[#4a4088] bg-[#15112e] p-5">
                <b.icon className="size-5 text-[#ffd23f]" aria-hidden />
                <h3 className="mt-3 font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm text-[#b0a9cf]">{b.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="font-pixel text-[0.6rem] uppercase text-primary">Help menu</p>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight">Pertanyaan yang sering muncul</h2>
        <BouncyAccordion
          className="mt-8"
          classNames={{ item: "rounded-sm border-2 border-border bg-card", title: "font-semibold text-left", description: "text-muted-foreground" }}
          items={FAQ.map((f, i) => ({ id: `faq-${i}`, title: f.q, description: f.a }))}
        />
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 rounded-md border-2 border-ink bg-coin p-8 text-[#0b0820] shadow-arcade-lg sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <p className="font-pixel text-[0.6rem] uppercase">Ready player one?</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Kamera sudah siap. Kamu?</h2>
          </div>
          <Link
            href="/camera?type=sticker"
            className="inline-flex min-h-13 items-center gap-2 rounded-sm border-2 border-ink bg-[#0b0820] px-6 font-bold uppercase tracking-wide text-[#ffd23f] arcade-press"
          >
            <Camera className="size-5" aria-hidden /> Mulai sekarang
          </Link>
        </div>
      </section>
    </>
  );
}
