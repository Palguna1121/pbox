# Handoff proyek PBOX

Kondisi kode per 27 Oktober 2026, setelah rombakan besar: tema arcade, editor fabric.js, storage lokal, SEO/GEO, dan jembatan hardware booth. Perubahan ini belum dikomit. Patch cadangan dari keadaan sebelum rombakan ada di scratchpad sesi (`pre-rombak-staged.patch`), dan perubahan pengguna yang sebelumnya di-stage tetap ada di index git. Peta sistem: [ARCHITECTURE.md](ARCHITECTURE.md). Desain: [DESIGN.md](DESIGN.md). Bukti uji: [QA.md](QA.md).

## Produk

Tiga mode masuk lewat `/camera?type=...`:

| Mode | URL | Alur |
| --- | --- | --- |
| Photobox | `/camera?type=frame&frameId=<id>` | Pilih frame, N jepretan sesuai slot, edit, hasil |
| Sticker Pic | `/camera?type=sticker` | Foto, edit (rasio 1:1/4:5/9:16/16:9), hasil |
| Foto Formal | `/camera?type=formal&formalId=<id>` | Pilih latar, foto, edit (ukuran, warna latar, hapus latar), hasil |

Tanpa `frameId`/`formalId`, studio menampilkan pemilih katalog. Sumber foto bisa webcam (pilih perangkat, 720p/1080p/4K, cermin, hitung mundur 3/5/10 dtk, suara), kamera booth (bila agen aktif), atau unggah file.

Editor: 10 preset filter + 7 slider, stiker katalog atau PNG sendiri, teks 4 font, kuas, panel objek (putar, balik, kunci, urutan, duplikat, hapus, opasitas), panel layer, ambil ulang/ganti foto per slot, undo/redo 60 langkah, pintasan keyboard, unduh PNG, dan simpan.

Hasil: halaman `/p/<shareToken>` (noindex) berisi unduh, Web Share/WhatsApp/X/Facebook/Telegram/salin, QR, dan cetak. Pengguna yang login melihat fotonya di dashboard dan bisa menghapusnya.

## Yang berubah

- **Next.js 15.1.7 → 16.4.3** (React 19.3.1, next-auth 4.24.15, ESLint 9). Lewat `@next/codemod upgrade`: `src/middleware.ts` menjadi `src/proxy.ts` dengan fungsi `proxy`, `next lint` diganti `eslint .`, Turbopack menjadi default untuk dev dan build. Cache Components **tidak** diaktifkan. Opt-out `instant = false` dari codemod dihapus karena tanpa `cacheComponents` export itu tidak berefek. Mengadopsinya nanti berarti mengganti `revalidate`/`dynamic` dengan `use cache`.

- **UI**: Tailwind v3 → v4 (`@tailwindcss/upgrade`), token arcade baru, font piksel lokal, komponen KaraUI di `src/components/motion/`, primitif `ui/*` di-restyle, header/footer/landing/studio/editor/dashboard/profil/pengaturan/auth/katalog/admin/404 diperbarui. `Toaster` sekarang benar-benar dipasang di layout (sebelumnya toast tidak pernah tampil).
- **Editor**: `FrameEditor`, `StickerEditor`, `FormalEditor`, `PhotoCapture`, dan `Testi` dihapus, diganti `src/components/editor/*` dan `Camera.tsx` baru.
- **Storage**: ImageKit dihapus (paket, `src/lib/imagekit.ts`, `src/app/utils/imagekit.ts`). Semua file lewat `src/lib/storage.ts` ke `STORAGE_DIR`.
- **Data**: migrasi `20261027000000_local_storage_share` dan `20261027120000_frame_placeholder_cascade` (sudah di-deploy ke DB lokal).
- **Slot frame otomatis**: frame tanpa `FramePlaceholder` dideteksi slotnya dari area transparan PNG (`src/lib/frame-slots.ts`) saat `GET /api/frames/[id]` pertama, lalu disimpan. Mengganti gambar frame mereset slot.
- **Format hasil**: disimpan sebagai JPEG (±150–200 KB); unduhan langsung dari editor tetap PNG.
- **Keamanan**: login credentials menolak akun tanpa password (akun Google). Upload dibatasi ukuran, tipe, dan laju. `/api/upscale` hanya untuk admin. Halaman admin memakai Prisma client bersama, bukan `new PrismaClient()` per file.
- **Cache**: katalog publik `revalidate = 60`, daftar admin `force-dynamic` (sebelumnya diprerender statis saat build, jadi perubahan admin tidak tampil).
- **SEO/GEO**: metadata + template judul, canonical, OG/Twitter image dinamis, robots, sitemap (termasuk detail frame/stiker), manifest, JSON-LD (WebSite, WebApplication, FAQPage), `llms.txt`, metadata per halaman, dan noindex untuk auth/dashboard/admin/share.

## Variabel lingkungan

Lihat `.env.example`. Variabel baru: `NEXT_PUBLIC_SITE_URL` (wajib di produksi untuk URL OG/sitemap/share), `STORAGE_DIR`, `BOOTH_AGENT_URL`, `BOOTH_AGENT_TOKEN`, `BOOTH_PUBLIC_PRINT`, `BOOTH_AGENT_PORT`, `BOOTH_SIMULATE`, `BOOTH_PRINTER`, `BOOTH_AGENT_HOST`. Variabel `IMAGEKIT_*` dan `PINATA_*` tidak dipakai lagi.

**Rotasi kredensial disarankan.** Dalam sesi rombakan, isi `.env` sempat tercetak di output tool (Google client secret, kunci ImageKit/Pinata, `NEXTAUTH_SECRET`). Nilainya tidak ditulis ke file mana pun, tetapi tetap rotasi kunci yang masih aktif.

## Batasan dan pekerjaan lanjutan

1. **Hardware belum diuji fisik.** Agen booth diuji dalam mode simulasi dan deteksi "gphoto2 tidak terpasang". Live view DSLR, capture, dan cetak CUPS ke printer foto belum dicoba di perangkat nyata. Cetak via browser (`window.print` + `@page`) belum dicek pada kertas.
2. **Cetak booth hanya 4R/A6 satu foto.** Strip dan lembar pas foto hanya lewat dialog cetak browser, karena agen mencetak satu gambar `fit-to-page`. Untuk cetak tanpa dialog, susun lembar di server (sharp) sebelum dikirim.
3. **Rate limit in-memory per proses dan membaca `x-forwarded-for`.** Di produksi, reverse proxy wajib menimpa header itu (kalau tidak, klien bisa memalsukannya). Untuk beberapa instance, pakai Redis atau limiter di proxy.
4. **Media publik berbasis kunci acak.** Siapa pun yang punya URL `/media/...` atau `/p/<token>` bisa melihat foto. Belum ada kedaluwarsa atau pembersihan otomatis untuk foto tamu.
5. **Kualitas hapus latar** bergantung pada model selfie (resolusi mask rendah). Rambut dan tepi tangan bisa kasar, jadi sampaikan sebagai fitur beta.
6. **Katalog seed di DB lokal** masih memakai URL `placehold.co` yang dipetakan ke file lokal oleh `catalog-assets.ts`. Jalankan `scripts/backfill-catalog-assets.mjs` bila ingin permanen.
7. **Lint** sudah jadi gate (0 error). Komponen registry di `src/components/motion|ui` dan `src/lib/hooks` mendapat aturan React Compiler sebagai warning, bukan error (lihat `eslint.config.mjs`). Masih ada 19 warning.
8. **Upscale RealESRGAN** masih belum tersambung (path skrip/model tidak cocok) dan tidak dipakai UI.
9. Admin belum punya editor koordinat `FramePlaceholder` dan CRUD latar formal.

10. **QR dan tautan share memakai `NEXT_PUBLIC_SITE_URL`.** Di booth, isi dengan domain atau IP LAN yang bisa dibuka HP tamu, bukan `localhost`. Kamera browser di mesin booth tetap butuh HTTPS atau `localhost`.
11. Deteksi slot otomatis hanya mengenali jendela transparan tertutup (alpha < 24). Frame dengan lubang semi-transparan atau menyentuh tepi gambar tidak terdeteksi, dan akan memakai satu slot penuh.

## Titik lanjut

1. Rotasi kredensial, isi `NEXT_PUBLIC_SITE_URL` dan `STORAGE_DIR` (volume persisten), lalu jalankan `npx prisma migrate deploy` di server.
2. Uji alur penuh di HP nyata (kamera depan/belakang, Web Share) dan di laptop booth dengan printer.
3. Bila memakai DSLR: pasang gphoto2 + CUPS, jalankan `npm run booth:agent`, isi `BOOTH_AGENT_URL`/`BOOTH_AGENT_TOKEN`.
4. Commit bertahap: fondasi Tailwind/token → storage/API/migrasi → editor/studio → halaman → docs.
