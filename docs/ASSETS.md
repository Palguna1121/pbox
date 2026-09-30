# Aset katalog PBOX

Katalog contoh sekarang memakai file lokal. Master disimpan di `assets/source/`, sedangkan URL aplikasi menunjuk ke `public/images/`. Jangan jalankan seed hanya untuk mengganti URL pada database yang sudah berisi data pengguna.

| Jenis | Jumlah | Master | Versi web | Fungsi |
| --- | ---: | --- | --- | --- |
| Frame | 20 | `assets/source/frames/*.svg` | `public/images/frames/*.png` | Overlay 480 × 640 dengan lubang transparan sesuai `FramePlaceholder` |
| Stiker | 20 | `assets/source/stickers/*.png` | `public/images/stickers/*.png` | Gambar transparan yang dapat ditempel di canvas |
| Latar formal | 5 | `assets/source/formal/*.svg` | `public/images/formal/*.png` | Bidang warna polos 1200 × 900 |

Stiker dibuat satu per satu dengan imagegen bawaan. Prompt dasarnya:

```text
Use case: stylized-concept. Asset type: transparent sticker graphic for a consumer photobooth editor. Subject: [SUBJECT]. Composition: exactly one isolated centered object, clear silhouette at small size, generous transparent margin. Style: polished handcrafted 2D sticker with restrained dimensional shading, fitting a coral and warm-neutral studio brand. Constraints: genuine transparent background and clean alpha edge; no people, letters, border, ground, watermark, or additional objects.
```

`[SUBJECT]` diganti dengan objek berikut, masing-masing untuk satu berkas sesuai slug namanya: mahkota emas tiga puncak, pita satin merah, dasi kupu-kupu sutra arang, kristal berlian bening, strip film 35 mm, kamera analog 1970-an, piringan vinil hitam, bingkai foto instan vintage, bintang neon hijau mint, petir coral, panah arang mengarah kanan atas, empat titik piksel coral, bunga merah muda, kupu-kupu lavender, hati pastel coral, bintang emas berkilau, wajah kucing krem, dinosaurus bayi hijau mint, es krim stroberi, dan lengkung pelangi. Prompt mahkota pertama memakai deskripsi lebih rinci tentang tiga puncak dan logam emas; semua hasil diminta dengan latar benar-benar transparan.

Frame dibuat sebagai SVG agar lubang foto mengikuti posisi seed secara tepat. `scripts/generate-catalog-frames.mjs` menulis ulang sumber SVG; untuk membuat PNG web setelah perubahan desain frame, jalankan:

```bash
node scripts/generate-catalog-frames.mjs
for source in assets/source/frames/*.svg; do name=${source##*/}; convert -background none "$source" "public/images/frames/${name%.svg}.png"; done
```

Latar formal sengaja berupa warna polos yang akurat, bukan hasil generatif. Tekstur atau objek tambahan akan mengubah kegunaan foto dokumen. Sumber SVG dapat dirender ulang ke PNG dengan `convert` sambil mempertahankan ukuran 1200 × 900.

`prisma/seed.ts` memakai URL lokal untuk entri baru. `src/lib/catalog-assets.ts` memetakan hanya entri seed bernama dikenal yang masih memiliki URL `placehold.co` ke file lokal saat dibaca, tanpa mengubah URL unggahan pengguna. Jika koneksi database tersedia, `node --env-file=.env scripts/backfill-catalog-assets.mjs` dapat mengganti URL placeholder itu secara permanen. Skrip tersebut memeriksa seluruh file sebelum transaksi dan hanya memperbarui URL yang masih cocok dengan nilai lama.
