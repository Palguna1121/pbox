# PBOX

PBOX adalah aplikasi studio foto berbasis web. Pengunjung dapat melihat katalog frame, stiker, dan latar foto formal; kamera browser dan editor canvas dipakai untuk membuat foto. Tampilannya bertema arcade/retro. Editor berbasis fabric.js mendukung frame multi-slot, stiker, teks, kuas, filter, layer, undo, dan hapus latar di perangkat. Hasil disimpan ke disk lokal (`STORAGE_DIR`), metadata dan katalog di PostgreSQL, lalu dapat diunduh, dibagikan lewat tautan dan QR, atau dicetak.

## Mulai di sini

- [SETUP.md](SETUP.md) — prasyarat, variabel lingkungan, database, seed, dan menjalankan aplikasi lokal.
- [docs/HANDOFF.md](docs/HANDOFF.md) — arsitektur, alur pengguna, peta kode dan API, status verifikasi, serta pekerjaan lanjutan.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — batas sistem, aliran data, auth, dan model.
- [docs/DESIGN.md](docs/DESIGN.md) — identitas visual, token, komponen, aset, dan aturan motion.
- [docs/ASSETS.md](docs/ASSETS.md) — inventaris dan cara memelihara gambar katalog lokal.
- [docs/PREFERENCES.md](docs/PREFERENCES.md) — aturan kerja dan batas perubahan proyek.
- [docs/QA.md](docs/QA.md) — hasil pemeriksaan dan smoke test untuk penerus.
- [AGENTS.md](AGENTS.md) — petunjuk ringkas untuk agen yang bekerja di repo.

Ringkasan menjalankan lokal setelah menyiapkan `.env` sesuai [SETUP.md](SETUP.md):

```bash
npm install
docker compose up -d
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
npm run dev
```

Buka `http://localhost:3000`. Seed membuat akun dan konten contoh; kredensial contoh hanya untuk lingkungan lokal.

## Teknologi utama

Next.js 16 App Router (Turbopack), React 19.3, TypeScript, Tailwind CSS v4, Motion, komponen KaraUI (registry shadcn, MIT), fabric.js 6, MediaPipe Tasks Vision, NextAuth v4, Prisma 6, PostgreSQL 15, dan sharp untuk validasi gambar. Upscaling RealESRGAN memiliki kode Python, tetapi integrasi API-nya belum siap digunakan; lihat catatan di [dokumen handoff](docs/HANDOFF.md#batasan-dan-pekerjaan-lanjutan).
