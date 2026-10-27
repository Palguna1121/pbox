import { site, siteUrl } from "@/lib/site";

export const revalidate = 86400;

// Format: https://llmstxt.org
export function GET() {
  const body = `# ${site.name}

> ${site.description}

${site.name} berjalan di browser dan berbahasa Indonesia. Pengunjung dapat memakai kamera tanpa akun; akun dibutuhkan untuk menyimpan riwayat foto di dashboard. Foto hasil disimpan di server ${site.name}, mendapat tautan berbagi pribadi (/p/<token>) yang tidak diindeks mesin pencari, dan dapat diunduh, dibagikan, atau dicetak.

## Mode foto

- [Photobox](${siteUrl("/photobox")}): pilih frame dari katalog, ambil foto dengan hitung mundur, lalu foto ditempatkan di slot frame.
- [Sticker Pic](${siteUrl("/sticker-pic")}): ambil foto lalu tempel dan atur stiker dari katalog.
- [Foto Formal](${siteUrl("/formal-pic")}): foto dengan latar warna dan ukuran pas foto (2×3, 3×4, 4×6 cm) yang bisa dicetak berjajar di kertas 4R.

## Fitur editor

- Kamera browser (getUserMedia) dengan hitung mundur, atau kamera booth melalui agen lokal.
- Frame, stiker, latar formal, dan filter warna; hasil dirender di canvas lalu disimpan sebagai PNG.
- Unduh, bagikan lewat Web Share API atau tautan WhatsApp/X/Facebook/Telegram, dan kode QR untuk tamu booth.
- Cetak dari browser dengan preset 4R (4×6 in), strip 2×6 in, A6, dan lembar pas foto.

## Dukungan perangkat keras

- Kamera DSLR/mirrorless lewat gphoto2 dan printer lewat CUPS, dijembatani oleh agen lokal (scripts/booth-agent.mjs).
- Dukungan ini dibangun dari dokumentasi gphoto2 dan CUPS dan belum diuji pada perangkat fisik. Tersedia mode simulasi.
- Cetak tanpa dialog hanya bisa di mode kiosk browser, misalnya Chrome dengan --kiosk-printing.

## Tautan penting

- [Beranda](${siteUrl("/")})
- [Daftar akun](${siteUrl("/register")})
- [Masuk](${siteUrl("/login")})
- [Sitemap](${siteUrl("/sitemap.xml")})

## Optional

- [Manifest aplikasi](${siteUrl("/manifest.webmanifest")})
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
