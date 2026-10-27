# Desain PBOX

Acuan visual PBOX setelah rombakan 27 Oktober 2026. Palet coral lama diganti total atas keputusan pengguna. Arahnya sekarang arcade/retro: kabinet game, layar CRT, cartridge, dan HUD. Prioritasnya tetap keterbacaan dan alur foto yang jelas, sedangkan metafora game berperan sebagai bumbu.

## Prinsip

- **Arcade di permukaan, alat yang jelas di dalam.** Label piksel, HUD, dan bayangan offset memberi karakter. Copy, label form, dan kontrol editor tetap bahasa Indonesia biasa.
- **Jujur.** Jangan tampilkan statistik, testimoni, atau kemampuan yang belum didukung kode. Fitur hardware disebut eksperimental sampai diuji di perangkat fisik.
- **Gerak punya tujuan.** Hitung mundur, flash kamera, reveal sekali, dan umpan balik tombol. Semua animasi menghormati `prefers-reduced-motion` (CSS global dan `useReducedMotion`).

## Token

Semua token ada di `src/app/globals.css` (Tailwind v4 `@theme`). Nilainya warna penuh (hex), jadi modifier seperti `bg-primary/20` tetap berfungsi.

| Token | Arcade Night (gelap, default) | Arcade Day (terang) | Pemakaian |
| --- | --- | --- | --- |
| `background` | `#0b0820` | `#fff6e2` | Dasar halaman |
| `foreground` | `#f5efe0` | `#1a1238` | Teks utama |
| `card` / `popover` | `#15112e` / `#1a1538` | `#ffffff` | Permukaan panel |
| `primary` | `#ffd23f` (koin) + teks `#0b0820` | `#d1105a` (magenta) + teks putih | Aksi utama, sorotan |
| `accent` | `#ff3d7f` | `#ffc400` | Isian aksen |
| `muted` / `muted-foreground` | `#1c1740` / `#b0a9cf` | `#f6e9cb` / `#574d78` | Bagian penunjang |
| `border` | `#4a4088` | `#1a1238` (tinta) | Garis 2px |
| `ring` | `#3ef0ff` (cyan) | `#0a7f99` | Fokus keyboard, outline 3px |
| `ink` | `#000000` | `#1a1238` | Bayangan offset |
| `coin`, `neon-pink`, `neon-cyan`, `neon-lime` | Warna arcade tetap | Varian lebih gelap | Badge, HUD, status |

Primary berganti hue per tema dengan sengaja. Kuning koin di atas latar krem tidak cukup kontras untuk teks, jadi mode terang memakai magenta. Untuk isian kuning di kedua tema, pakai `bg-coin` dengan teks `#0b0820` (varian tombol `secondary`).

Default tema adalah gelap (`defaultTheme="dark"`), dan pengguna dapat beralih lewat tombol di header.

## Tipografi

| Peran | Font | Kelas | Aturan |
| --- | --- | --- | --- |
| Label/HUD | Press Start 2P | `font-pixel` | Hanya teks pendek kapital, 0.5–0.75rem. Jangan untuk paragraf. |
| Heading | Pixelify Sans (variable) | `font-display` | H1–H3, bobot 700, tracking rapat |
| Angka/skor | VT323 | `font-mono` | Ukuran besar (≥1.125rem) karena glyph kecil |
| Isi | Geist Sans | `font-sans` | Paragraf, form, kontrol |

Font piksel dipasang lokal lewat paket `@fontsource`, jadi build tidak mengambil font dari jaringan. Variabel font Geist dipasang di elemen `<html>`. Kalau dipasang di `<body>`, token `--font-sans` di `:root` menjadi invalid.

## Bentuk dan utilitas

- Border 2px, radius kecil (`--radius: 0.25rem`). `rounded-full` hanya untuk titik dekoratif.
- Bayangan offset: `shadow-arcade`, `shadow-arcade-sm`, `shadow-arcade-lg`.
- `arcade-panel`: permukaan kartu dengan border dan bayangan.
- `arcade-press`: tombol terangkat saat hover dan tenggelam saat ditekan (sudah ada di `Button`).
- `bg-arcade-grid`: grid latar, `crt-lines`: scanline overlay dekoratif (`aria-hidden`), `text-outline`: teks berkontur tinta di atas foto.
- `.print-sheet`: saat mencetak hanya elemen ini yang tampil.

## Komponen

- `src/components/ui/*`: primitif shadcn/Radix yang sudah di-restyle (Button, Card, Input, Dialog, Select, Toast, dll.).
- `src/components/motion/*`: komponen KaraUI (MIT, dipasang via registry `@karaui` di `components.json`). Yang dipakai: SegmentedControl, RangeSlider, ColorPickerPopover, Tooltip, Kbd, Marquee, BouncyAccordion, CopyButton, HoldActionButton, NotFoundGlitch, NumberTicker. Komponen ini berbasis token, jadi ikut tema. Pasang yang baru dengan `npx shadcn@latest add @karaui/<nama>`.
- `src/components/arcade/*`: `Logo`, `PageIntro`, `PixelLabel`.

## Pola halaman

- **Landing**: hero dengan kabinet arcade dan foto di layar CRT, marquee fitur, "Select mode" (tiga cartridge), "How to play" (4 level), daftar fitur editor, seksi booth, FAQ (juga sebagai JSON-LD FAQPage), dan CTA kuning.
- **Studio `/camera`**: bilah tahap (Pilih, Foto, Edit, Hasil), layar kamera ber-HUD, hitung mundur piksel, flash, strip jepretan.
- **Editor**: bilah atas (kembali, undo/redo, zoom, unduh, simpan), rail alat (kiri di desktop, bawah di mobile), stage bergrid, dan inspector (kanan di desktop, di bawah kanvas pada mobile).

## Aksesibilitas

- Fokus terlihat (outline cyan 3px). Target sentuh ≥44px. Skip link tersedia.
- Rail alat editor memakai `role="toolbar"` dengan roving focus (panah/Home/End). Panel Layer menjadi jalur keyboard untuk memilih objek kanvas, panah menggeser objek, `[`/`]` mengubah urutan.
- Status kamera, hitung mundur, dan hasil hapus latar diumumkan lewat `aria-live`.
- Kanvas fabric tidak dapat diakses pembaca layar secara langsung; panel Layer dan Objek adalah alternatifnya.

## Aset

Foto hero, ikon `P`, serta 45 aset katalog tetap sama; lihat [ASSETS.md](ASSETS.md). Model segmentasi `public/models/selfie_segmenter.tflite` (MediaPipe, Apache-2.0) dikomit. Runtime WASM MediaPipe disalin ke `public/vendor/mediapipe` oleh `postinstall` dan tidak dikomit.
