# Pemeriksaan dan penerimaan

Gunakan daftar ini saat mengambil alih proyek atau setelah mengubah alur. Status terbaru dicatat 27 Oktober 2026; ulangi pemeriksaan di lingkungan yang akan dipakai.

## Upgrade Next.js 16.4.3

| Pemeriksaan | Hasil |
| --- | --- |
| `tsc --noEmit` | Lulus |
| `npm run lint` | 0 error, 19 warning (setelah perbaikan, lihat di bawah) |
| `npm run build` | Lulus, Turbopack, 35 halaman, 0 warning (akses fs dinamis di storage diberi `turbopackIgnore`) |
| HTTP | Route publik 200, `/dashboard`, `/admin`, `/profile`, `/settings` 307 ke `/login` lewat `proxy.ts`, 404 benar |
| Browser | Login admin, daftar admin, sesi frame 4 jepretan via kamera booth, filter, simpan, share + QR, cetak booth, hapus dari galeri, ganti tema, logout. Tanpa error konsol |

Perbaikan dari lint React Compiler: daftar objek editor dipindah dari ref ke state (render tidak lagi membaca `canvasRef.current`), panel filter membaca nilai langsung dari objek foto, menu header terikat ke path, ikon tema lewat CSS `dark:` (tanpa flag mounted), dan tipe `any` di auth/pengaturan diganti.

## Uji skenario nyata 27 Oktober 2026 (build produksi)

Dijalankan dengan `next start` (build bersih), agen booth `BOOTH_SIMULATE=1`, Chrome headless dengan kamera palsu, interaksi mouse/keyboard asli.

| Skenario | Hasil |
| --- | --- |
| Daftar akun baru → login → dashboard kosong | Lulus |
| Sticker Pic via **kamera booth** (live view + capture lewat bridge) | Lulus |
| Editor: preset, crop 4:5, tambah stiker, **drag & resize dengan mouse**, Ctrl+D, Delete, Ctrl+Z/Ctrl+Shift+Z, double-click lalu ketik ulang teks | Lulus (jumlah layer 3→4→3→4→3) |
| Simpan → halaman share → QR (didekode jsQR = URL share yang benar) → kirim ke printer booth (job masuk spool) | Lulus |
| Galeri dashboard → hapus dengan tekan-tahan → baris DB dan file hilang → tautan lama 404 | Lulus |
| Admin unggah frame baru → slot dideteksi otomatis → sesi 2 jepretan → hapus frame (file ikut terhapus) | Lulus setelah perbaikan |
| Admin unggah stiker → langsung tersedia di editor → hapus | Lulus |
| Formal: unggah foto, 3×4, hapus latar, simpan sebagai tamu, lembar cetak 6 pas foto di 4R | Lulus |
| Strip 2×6 di 4R dengan garis potong | Lulus |
| Keyboard: urutan Tab header, outline 3px, menu akun via fokus, logout dengan Enter, Space untuk jepret, pintasan alat T/V/…, panah/Home/End di rail | Lulus |
| Reduced motion (`prefers-reduced-motion`) | Durasi animasi 0,01 ms |
| iPhone 12 (emulasi): menu, kamera → editor → hasil, tanpa scroll horizontal | Lulus |
| Login salah, akun Google lewat credentials, daftar email ganda | Pesan error benar; akun Google ditolak |
| Akses anonim ke GET/DELETE images, booth print, upload admin; GIF; path traversal `/media` | 401/415/404 sesuai |
| Rate limit upload | Permintaan ke-21 → 429 |

**Bug yang ditemukan dan diperbaiki dalam uji ini:**
- Frame yang punya slot (termasuk 20 frame seed) tidak bisa dihapus karena FK `FramePlaceholder` tanpa cascade, dan UI diam saja. Diperbaiki dengan migrasi `20261027120000_frame_placeholder_cascade`, toast error/sukses, redirect ke daftar, dan file aset ikut dihapus.
- Frame unggahan admin tidak punya slot, sehingga semua lubang terisi satu foto. Sekarang `src/lib/frame-slots.ts` mendeteksi jendela transparan (hasil di frame seed cocok ±4 px) dan menyimpannya saat frame pertama kali dibuka.
- Hasil foto PNG 5,1 MB, kini disimpan sebagai JPEG (±150–200 KB). Unduhan dari editor tetap PNG.
- Opsi cetak "Isi penuh (potong tepi)" ditambahkan, dan latar putih dipaksa saat print.
- Teks Inggris tersisa di admin (Cancel/Delete, pesan validasi, tanggal) diterjemahkan, tanggal memakai locale `id`.
- Prisma mencetak semua query di produksi; kini hanya error.
- `.next` bisa tercampur bila `next dev` (Turbopack) masih jalan saat `npm run build`. Hentikan dev server sebelum build.

**Masih belum diuji:** DSLR/printer fisik, kertas hasil cetak sebenarnya (alat PDF yang dipakai memaksa ukuran Letter), Web Share di HP asli, Safari/Firefox.

## Rombakan arcade 27 Oktober 2026

| Pemeriksaan | Hasil | Batas bukti |
| --- | --- | --- |
| TypeScript | `./node_modules/.bin/tsc --noEmit` lulus tanpa error | Statis |
| Build produksi | `npm run build` lulus, 36 halaman statis | DB lokal tersedia saat build |
| Migrasi | `20261027000000_local_storage_share` diterapkan, `prisma migrate status` up to date | DB pengembangan saja |
| Landing desktop gelap/terang | Dicek via screenshot headless Chrome 1440px; font piksel, token, marquee, FAQ tampil | Ada bug font (variabel Geist di `<body>`) yang ditemukan lalu diperbaiki |
| Studio Photobox | Kamera palsu Chrome: pilih frame Film 90an, 4 jepretan beruntun, masuk editor, 4 foto ter-clip ke slot | Kamera palsu, bukan webcam nyata |
| Editor | Preset filter, tambah stiker katalog, tambah teks, undo/redo, simpan → PNG 1801×2400 tersimpan di `storage/photos/...`, hasil + tombol share/cetak tampil | Tanpa uji drag manual dengan mouse |
| Formal + hapus latar | Unggah foto berisi orang, hapus latar (MediaPipe self-host), latar merah: subjek terpisah dengan benar | Satu foto uji; tepi rambut belum dinilai |
| Mobile 390px | Editor sticker dan katalog tema terang: tidak ada scroll horizontal, rail alat di bawah | Headless, bukan perangkat sentuh |
| Share/SEO | `/p/<token>`: `noindex`, `og:image`, `twitter:card` benar; `robots.txt`, `sitemap.xml`, `llms.txt`, `opengraph-image`, manifest memberi 200 | URL absolut mengikuti `NEXT_PUBLIC_SITE_URL`/`NEXTAUTH_URL` |
| Storage | Rotasi EXIF + strip metadata, alpha PNG tetap, tolak non-gambar/GIF, 6 pola path traversal ditolak | Skrip uji agen backend |
| Agen booth | Mode simulasi: token wajib, status/preview/capture/print OK, input `media` berbahaya ditolak | **Belum diuji dengan DSLR/printer fisik** |
| Belum dicek | Navigasi keyboard penuh di browser, reduced motion di browser, dialog cetak pada kertas, Web Share di HP, login/admin setelah restyle | Lakukan smoke test di bawah |

## Hasil pemeriksaan 29 September 2026

| Pemeriksaan | Hasil | Batas bukti |
| --- | --- | --- |
| Instalasi `motion` dan `geist` | Berhasil; `package.json` dan `package-lock.json` sinkron pada daftar dependensi langsung | npm audit melaporkan 25 temuan yang belum ditelaah |
| HTTP landing lokal | `GET /` memberi HTTP 200 dari Next dev di `127.0.0.1:3001` | Membuktikan respons server, bukan tampilan/interaksi browser |
| Aset hero | PNG sumber dan WebP turunan ada di repo; URL WebP memberi HTTP 200 | Crop dan kontras foto perlu dilihat pada browser |
| TypeScript | `./node_modules/.bin/tsc --noEmit` lulus setelah signature `params` disesuaikan dengan Next.js 15 | Belum menggantikan uji perilaku route pada browser |
| Build produksi | `npm run build` lulus, termasuk kompilasi, pemeriksaan tipe, dan pembuatan 33 halaman statis | Katalog dibaca dari database lokal saat build; hasil dapat berbeda menurut data lingkungan |
| Lint | `npm run lint` membuka wizard konfigurasi ESLint dan keluar status 1 | Belum ada pemeriksaan lint noninteraktif |
| Pemeriksaan browser visual | Belum dilakukan; browser UI tidak tersedia melalui computer-use pada sesi ini | Desktop, mobile, tema, keyboard, dan reduced motion masih perlu inspeksi langsung |
| Database, auth, ImageKit, kamera | Query katalog database berhasil saat build; login, mutasi data, ImageKit, dan kamera belum diuji langsung | Memerlukan layanan dan izin perangkat yang nyata |

## Pemeriksaan aset katalog 30 September 2026

- Tersedia 20 PNG frame 480 × 640, 20 PNG stiker transparan, dan 5 PNG latar formal 1200 × 900; sumber masing-masing tersimpan terpisah.
- Sampel koordinat `(100,100)` pada semua frame transparan, sesuai area slot pertama. Sudut `(0,0)` pada semua stiker transparan. Seluruh 45 nama di seed cocok dengan file web. `./node_modules/.bin/tsc --noEmit` dan `git diff --check` lulus.
- Seed baru memakai URL lokal. Halaman katalog, detail, admin, dan route GET kamera memetakan URL placeholder pada entri seed lama ke aset lokal. Tampilan contoh frame memakai foto hero di belakang overlay.
- Pembaruan URL database lama belum dijalankan: koneksi PostgreSQL tidak tersedia dari lingkungan sesi ini. `npm run build` berhasil mengompilasi dan memeriksa tipe, lalu worker keluar dengan kode 1 saat pembuatan halaman statis tanpa rincian galat. Browser katalog dan editor berkamera belum diuji langsung di sini; jalankan smoke test di bawah saat layanan tersedia.

## Identitas dan homepage 1 Oktober 2026

- Mark kamera-aperture berbentuk `P` tersedia di `public/images/pbox-icon.png` dan terhubung ke metadata ikon Next.js. Header dan footer menampilkan mark diikuti teks `Box`, menghindari lockup ganda `PpBox`.
- Homepage memakai hierarki Geist, foto hero, dan daftar layanan editorial dengan preview aset katalog; layanan Photobox, Sticker Pic, dan Foto Formal tetap menuju route yang sama.
- `./node_modules/.bin/tsc --noEmit` dan `git diff --check` lulus setelah revisi.
- Browser tidak tersedia pada sesi ini, jadi tampilan responsif, terang/gelap, keyboard, dan reduced motion belum diperiksa secara visual.

## Urutan smoke test manual

1. Siapkan `.env` sesuai [SETUP.md](../SETUP.md), PostgreSQL lokal, lalu jalankan migration dan seed **hanya pada database pengembangan**.
2. Jalankan `npm run dev`. Buka `/` pada 375px, 768px, 1024px, dan 1440px. Pastikan teks hero, foto, CTA, dan kartu layanan tidak terpotong atau memicu scroll horizontal.
3. Uji tema terang dan gelap. Periksa keterbacaan teks pada foto hero, CTA coral, menu, dan footer.
4. Navigasi dengan Tab dan Enter: tautan lewati konten, dropdown layanan, tombol tema, menu mobile, tautan katalog. Fokus harus tetap terlihat.
5. Aktifkan `prefers-reduced-motion: reduce`; reveal dan drawer harus menjadi statis atau segera selesai. Uji juga saat preferensi normal agar transisinya terlihat dan tidak menghalangi klik.
6. Coba registrasi dan login credentials; uji pengguna biasa dan admin untuk halaman yang dijaga. Jangan menguji akun Google dengan password sembarang pada sistem yang memuat data nyata sebelum risiko di `src/lib/auth.ts` ditangani.
7. Buka ketiga katalog, izinkan kamera pada localhost/HTTPS, ambil foto, edit, dan simpan. Buka halaman `/p/<token>` dan URL `/media/...`, pastikan berkas terbaca, QR mengarah ke halaman share, dan dialog cetak menampilkan ukuran kertas yang benar.
8. Dengan akun admin, uji pembuatan kategori/frame/stiker, upload file, serta penghapusan. Periksa frame baru yang belum memiliki `FramePlaceholder`.
9. Jalankan `npm run build` dan `./node_modules/.bin/tsc --noEmit` pada lingkungan penerus. Geist sekarang memakai paket lokal; pastikan build tetap lulus setelah perubahan data atau dependensi.

## Kriteria sebelum produksi

- Login credentials akun OAuth dan format upload data URL sudah diperbaiki di kode; verifikasi ulang di lingkungan target.
- Kebijakan akses, ukuran, dan laju upload hasil foto telah ditentukan.
- Tidak ada akun/password seed contoh yang dapat dipakai publik.
- Build dan pemeriksaan statis tetap lulus setelah perubahan berikutnya; lint noninteraktif disiapkan sebagai gate tersendiri.
- Alur pengguna penuh telah dilihat dan diuji pada browser serta perangkat berkamera.

Rincian teknis setiap batasan ada di [HANDOFF.md](HANDOFF.md#batasan-dan-pekerjaan-lanjutan).
