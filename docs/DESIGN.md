# Desain PBOX

Dokumen ini menjadi acuan visual untuk halaman PBOX. Arah desain diekstrak dari tema coral, Geist, komponen, dan alur foto yang sudah ada. Perubahan pada landing mempertahankan identitas dan URL proyek; halaman admin dan editor tetap mengutamakan kejelasan tugas.

## Arah visual

PBOX adalah studio foto konsumen yang ramah dan langsung dipakai. Foto manusia menjadi materi utama; coral dipakai untuk tindakan dan penekanan, sedangkan permukaan netral menjaga editor dan katalog tetap mudah dibaca. Landing memakai satu foto editorial yang nyata untuk produk, hirarki teks kuat, lalu kartu layanan yang tidak seragam. Tidak ada statistik penggunaan atau testimoni yang belum terverifikasi.

Pilihan ini mengikuti audit dari `ui-ux-pro-max`, `redesign-existing-projects`, `design-dna`, `design-taste-frontend`, dan `high-end-visual-design`. Rekomendasi mesin desain berupa latar hitam murni serta pasangan Fredoka/Nunito tidak diterapkan karena bertabrakan dengan brand coral dan font Geist yang sudah dipakai. Pola komponen dan alur proyek lebih tinggi prioritasnya daripada preset skill.

## Design DNA

| Dimensi | Keputusan yang dapat diterapkan |
| --- | --- |
| Sistem | Token semantik HSL di `src/app/globals.css`; Tailwind CSS v3 dan CSS variable untuk mode terang/gelap |
| Gaya | Ramah, fotografis, energik dengan susunan yang tenang; heading sans tegas dan copy Indonesia yang langsung |
| Efek visual | Foto studio sebagai hero, gradasi gelap untuk keterbacaan, reveal masuk dan drawer mobile dengan Motion; tanpa WebGL atau efek terus-menerus |

Versi terstruktur untuk alat atau agen lain ada di [DESIGN_DNA.json](DESIGN_DNA.json).

### Warna dan tipografi

| Token | Terang | Gelap | Pemakaian |
| --- | --- | --- | --- |
| `--background` | `hsl(0 0% 100%)` | `hsl(222 47% 6%)` | Dasar halaman |
| `--foreground` | `hsl(222 47% 11%)` | `hsl(0 0% 96%)` | Teks utama |
| `--primary` | `hsl(352 72% 43%)` | `hsl(352 78% 62%)` | Tombol, tautan penting, brand |
| `--primary-foreground` | putih | `hsl(222 47% 6%)` | Teks di atas primary |
| `--muted` | `hsl(352 30% 97%)` | `hsl(222 30% 14%)` | Bagian penunjang |
| `--ring` | mengikuti primary | mengikuti primary | Fokus keyboard |

Primary terang diperdalam dari nilai awal agar teks putih di atasnya memiliki rasio kontras sekitar **6,18:1**. Primary gelap memakai teks gelap dengan rasio sekitar **5,48:1**. Pengukuran ini berlaku untuk pasangan warna token penuh; transparansi di atas foto harus diperiksa secara visual. Geist Sans menjadi font tampilan dan isi, Geist Mono tersedia untuk kebutuhan angka atau kode. Gunakan `text-balance` untuk heading pendek dan panjang baris isi sekitar 45-65 karakter.

### Bentuk dan tata letak

- Radius dasar komponen UI tetap `--radius: 0.75rem`; kartu layanan landing memakai radius 2rem untuk objek besar. Tombol aksi utama berbentuk pill. Aturan radius mengikuti ukuran objek, bukan acak.
- Lebar konten maksimum `max-w-7xl`. Hero memakai foto penuh dan teks di atas scrim, kartu layanan memakai susunan 7/5 dua baris, bagian cara kerja memakai teks kiri dan daftar kanan.
- Pada layar kecil semua susunan menjadi satu kolom, jarak tepi 1rem, dan target sentuh penting minimal 44px.
- Gambar hero memakai `next/image`, `priority`, dan ukuran tempat yang tetap untuk mengurangi pergeseran layout.

## Gerak

Gerak dipakai untuk menjelaskan hirarki atau perubahan status, bukan dekorasi berulang. Implementasi ada pada `src/components/MotionReveal.tsx` dan drawer di `src/components/Header.tsx` menggunakan paket `motion` (`motion/react`).

| Momen | Perilaku | Durasi |
| --- | --- | --- |
| Hero dan bagian yang masuk viewport | Opacity 0 ke 1, translasi Y 20px ke 0, sekali saja | 420ms; jeda 0-160ms |
| Buka/tutup navigasi mobile | Opacity dan translasi Y kecil; exit lebih ringan | 240ms |
| Hover kartu dan tombol | Translasi beberapa piksel sebagai umpan balik | 150-200ms |

Semua transisi posisi memakai `transform` dan `opacity`. `useReducedMotion()` meniadakan translasi Motion saat preferensi pengguna meminta gerak berkurang; CSS global juga mematikan animasi/transisi dan smooth scroll. Jangan menambahkan autoplay, parallax, atau scroll hijack tanpa tujuan produk dan uji perangkat.

## Aksesibilitas dan konten

- Fokus keyboard harus terlihat; layout memiliki tautan “Lewati ke konten”. Dropdown desktop dapat dibuka lewat fokus, dan tombol menu mobile memiliki nama serta status `aria-expanded`.
- Foto bermakna memakai alt yang menjelaskan isi; ikon dekoratif diberi `aria-hidden`.
- Pertahankan label formulir, pesan kesalahan, dan jalur kembali pada alur editor. Periksa kontras pada mode terang dan gelap setiap kali token berubah.
- Jangan menampilkan jumlah pengguna, testimonial, fitur AI, atau unduhan instan sebagai klaim bila kode dan data belum mendukungnya.
- Hindari tautan `#` yang tampak aktif, emoji sebagai ikon navigasi, dan copy generik yang tidak menjelaskan tindakan.

## Aset hero

- Sumber kualitas penuh: [`assets/source/pbox-hero.png`](../assets/source/pbox-hero.png), 1586 × 992 px.
- Turunan web: [`public/images/pbox-hero.webp`](../public/images/pbox-hero.webp), 1440 × 901 px, sekitar 74 KB.
- Dibuat dengan tool imagegen bawaan. Prompt yang digunakan untuk membuat master:

```text
Use case: photorealistic-natural. Asset type: wide hero photograph for an Indonesian online photobooth website, no UI mockup. Scene: small contemporary photo studio with a muted coral backdrop and soft off-white side wall. Subject: three Indonesian friends in their twenties, candid laughter while posing together for a self-timer photo; natural expressions, tasteful casual clothes, believable hands and faces. Composition: horizontal 16:10 editorial photograph, group weighted to the center and right, some calm negative space at left for potential cropping; camera-level perspective, frame-in-frame feel of a real photo booth, no printed photo strips. Lighting: soft direct flash with natural shadows and gentle film grain; energetic but polished. Palette: PBOX coral rose, warm white, deep charcoal, skin tones. Constraints: no words, no signage, no logo, no watermark, no interface, no collages, no extra people, no duplicated limbs.
```

Jika mengganti aset, simpan sumber terpisah dari turunan web, optimalkan ukuran web, lalu cek crop pada mobile dan desktop. Aset ini menggambarkan suasana layanan dan tidak boleh dipakai sebagai bukti pelanggan nyata.

## Aset katalog

Sebanyak 20 stiker transparan dibuat dengan imagegen dan disimpan sebagai master PNG serta turunan web yang lebih kecil. Dua puluh frame memakai overlay SVG presisi yang dirender ke PNG: lubang transparannya mengikuti koordinat `FramePlaceholder` seed untuk 1, 2, atau 4 foto. Lima latar formal berupa warna polos agar sesuai fungsi dokumen. Inventaris, prompt, dan perintah pembuatannya ada di [ASSETS.md](ASSETS.md).

Kartu frame menampilkan foto hero di belakang overlay hanya sebagai contoh tampilan slot. Editor tetap memakai foto hasil kamera pengguna di bawah overlay. Resolusi URL lama dari `placehold.co` ditangani oleh `src/lib/catalog-assets.ts` untuk entri seed yang dikenal.

## Audit dan batas penerapan

Sebelum perubahan, landing memakai emoji, hero berupa kartu tanpa foto, tiga kartu layanan setara, ticker promosi upscaling, statistik seed yang tampil sebagai klaim, dan testimoni hardcoded. Footer memiliki tautan `#`. Landing sekarang memakai foto dan copy yang sesuai alur saat ini; footer hanya menampilkan tujuan yang ada. `src/components/Testi.tsx` masih ada sebagai kode lama tetapi tidak dirender di landing. Geist dimuat dari paket npm lokal `geist`, sehingga build tidak perlu mengambil font dari Google Fonts.

Desain admin, katalog, dan editor belum diaudit secara visual pada browser dalam sesi ini. Gunakan [QA.md](QA.md) sebelum menyebut redesign selesai untuk seluruh aplikasi.
