# Petunjuk agen untuk PBOX

## Bahasa

Selalu berkomunikasi dengan pengguna dalam bahasa Indonesia. Biarkan kode, nama simbol, perintah, dan pesan galat dalam bentuk aslinya bila perlu untuk ketepatan teknis.

## Sebelum bekerja

1. Baca [README.md](README.md), lalu dokumen yang sesuai di `docs/`: [ARCHITECTURE.md](docs/ARCHITECTURE.md), [DESIGN.md](docs/DESIGN.md), [ASSETS.md](docs/ASSETS.md), [PREFERENCES.md](docs/PREFERENCES.md), [HANDOFF.md](docs/HANDOFF.md), dan [QA.md](docs/QA.md).
2. Jalankan `git status --short`. Repo dapat berisi perubahan pengguna yang belum dikomit; jangan menimpa atau meresetnya.
3. Telusuri implementasi aktual sebelum mengandalkan catatan status lama. Jika kode dan dokumen berbeda, perbaiki dokumen bersama perubahan yang dibuat.

## Kontrak proyek

- Stack: Next.js 16 App Router, TypeScript, Tailwind CSS v4, NextAuth v4, Prisma 6, PostgreSQL, penyimpanan file lokal (`src/lib/storage.ts`), fabric.js untuk editor. Jalur instalasi utama memakai npm.
- Pertahankan nama route, field formulir, API, dan alur kamera kecuali tugas secara jelas mengubahnya.
- `src/proxy.ts` (pengganti middleware di Next 16) menjaga halaman tertentu; setiap mutasi API harus memeriksa akses dalam route handler sendiri.
- Jangan jalankan seed contoh terhadap data yang perlu dipertahankan. Jangan membuka atau mencetak isi `.env` dan kredensial.
- Untuk visual, pertahankan tema arcade (token di `src/app/globals.css`, panduan di `docs/DESIGN.md`). Motion hanya untuk tujuan jelas, dengan reduced motion dan akses keyboard. Simpan sumber aset terpisah dari turunan web.

## Selesai bekerja

- Jalankan pemeriksaan yang relevan dan laporkan hasilnya secara jujur. Gate: `./node_modules/.bin/tsc --noEmit`, `npm run lint` (ESLint 9 flat config, harus 0 error), `npm run build`. Hentikan `next dev` sebelum build.
- Untuk perubahan UI, periksa desktop/mobile, terang/gelap, navigasi keyboard, dan reduced motion jika browser tersedia.
- Perbarui dokumentasi handoff ketika arsitektur, desain, setup, atau status verifikasi berubah.

<!-- antislop:start -->
## antislop
Untuk pekerjaan UI, copy, aksesibilitas, layout mobile, atau komentar kode, baca core lalu skill terkait:
- Core: `/home/nanaaa/.agents/skills/antislop/SKILL.md`
- UI / visual: `/home/nanaaa/.agents/skills/antislop-ui/SKILL.md`
- Copy & text: `/home/nanaaa/.agents/skills/antislop-copywriting/SKILL.md`
- People / aksesibilitas: `/home/nanaaa/.agents/skills/antislop-human/SKILL.md`
- Layout mobile: `/home/nanaaa/.agents/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `/home/nanaaa/.agents/skills/antislop-code/SKILL.md`
<!-- antislop:end -->
