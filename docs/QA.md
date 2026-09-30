# Pemeriksaan dan penerimaan

Gunakan daftar ini saat mengambil alih proyek atau setelah mengubah alur. Status di bawah dicatat pada 29 September 2026; ulangi pemeriksaan di lingkungan yang akan dipakai.

## Hasil pemeriksaan sesi ini

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

## Urutan smoke test manual

1. Siapkan `.env` sesuai [SETUP.md](../SETUP.md), PostgreSQL lokal, lalu jalankan migration dan seed **hanya pada database pengembangan**.
2. Jalankan `npm run dev`. Buka `/` pada 375px, 768px, 1024px, dan 1440px. Pastikan teks hero, foto, CTA, dan kartu layanan tidak terpotong atau memicu scroll horizontal.
3. Uji tema terang dan gelap. Periksa keterbacaan teks pada foto hero, CTA coral, menu, dan footer.
4. Navigasi dengan Tab dan Enter: tautan lewati konten, dropdown layanan, tombol tema, menu mobile, tautan katalog. Fokus harus tetap terlihat.
5. Aktifkan `prefers-reduced-motion: reduce`; reveal dan drawer harus menjadi statis atau segera selesai. Uji juga saat preferensi normal agar transisinya terlihat dan tidak menghalangi klik.
6. Coba registrasi dan login credentials; uji pengguna biasa dan admin untuk halaman yang dijaga. Jangan menguji akun Google dengan password sembarang pada sistem yang memuat data nyata sebelum risiko di `src/lib/auth.ts` ditangani.
7. Buka ketiga katalog, izinkan kamera pada localhost/HTTPS, ambil foto, edit, dan simpan. Buka URL hasil dari ImageKit dan pastikan berkas benar-benar dapat dibaca. Saat ini `/result` belum ada.
8. Dengan akun admin, uji pembuatan kategori/frame/stiker, upload file, serta penghapusan. Periksa frame baru yang belum memiliki `FramePlaceholder`.
9. Jalankan `npm run build` dan `./node_modules/.bin/tsc --noEmit` pada lingkungan penerus. Geist sekarang memakai paket lokal; pastikan build tetap lulus setelah perubahan data atau dependensi.

## Kriteria sebelum produksi

- Masalah login credentials akun OAuth dan format upload data URL sudah diperbaiki dan diverifikasi.
- Kebijakan akses, ukuran, dan laju upload hasil foto telah ditentukan.
- Tidak ada akun/password seed contoh yang dapat dipakai publik.
- Build dan pemeriksaan statis tetap lulus setelah perubahan berikutnya; lint noninteraktif disiapkan sebagai gate tersendiri.
- Alur pengguna penuh telah dilihat dan diuji pada browser serta perangkat berkamera.

Rincian teknis setiap batasan ada di [HANDOFF.md](HANDOFF.md#batasan-dan-pekerjaan-lanjutan).
