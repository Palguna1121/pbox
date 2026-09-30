# Preferensi kerja proyek

Ini adalah aturan kerja PBOX untuk orang atau agen yang melanjutkan proyek. Sumbernya adalah instruksi pengguna pada handoff ini dan pola yang telah dipilih di repo. Jika instruksi pengguna terbaru berbeda, ikuti instruksi terbaru itu.

## Komunikasi dan dokumentasi

- Gunakan bahasa Indonesia untuk pembaruan, pertanyaan, dokumentasi, dan jawaban. Pertahankan nama simbol, perintah, pesan galat, serta kutipan teknis dalam bahasa asal saat penerjemahan mengubah makna.
- Tuliskan keadaan yang sudah diverifikasi, keadaan parsial, dan rencana secara terpisah. Jangan menyebut suatu fitur atau build “siap” hanya dari hasil TypeScript atau proses yang berhasil dimulai.
- Perbarui [HANDOFF.md](HANDOFF.md) atau [QA.md](QA.md) ketika status, perintah, atau risiko berubah. Hubungkan berkas baru dari [README.md](../README.md).

## Batas perubahan

- Mulai dengan `git status`; ada perubahan kerja pengguna yang belum dikomit. Pertahankan perubahan di luar ruang tugas.
- Jaga URL, nama route, kontrak API, field formulir, dan perilaku editor kecuali perubahan memang diminta. Perubahan skema memerlukan migration yang dapat diperiksa.
- Untuk frontend, ubah komponen TSX/CSS sumbernya langsung. Gunakan Python hanya untuk bagian upscaling yang memang ditulis dalam Python.
- Jangan menyalin `.env`, key, token, atau URL berisi rahasia ke dokumen, log, atau output pengguna.

## Desain dan aset

- Pertahankan identitas coral PBOX, sistem token terang/gelap, serta copy yang sederhana. Ikuti [DESIGN.md](DESIGN.md) sebelum menambah pola visual baru.
- Gunakan gambar untuk tugas yang memang memerlukan fotografi. Simpan master di `assets/source/` dan turunan ringan di `public/images/`; tautan aplikasi harus menunjuk ke turunan web.
- Pakai Motion hanya ketika animasi membantu hirarki atau umpan balik. Hormati reduced motion. Pertahankan keyboard, fokus terlihat, kontras, target sentuh, dan layout responsif.
- Jangan menampilkan angka, testimoni, atau kemampuan yang belum didukung data dan kode sebagai fakta produk.

## Pengembangan dan validasi

- Jalur instalasi saat ini memakai npm. `package.json` dan `package-lock.json` harus tetap sinkron; `bun.lock` yang juga ada perlu keputusan pemeliharaan tersendiri.
- Perintah pemeriksaan utama: `./node_modules/.bin/tsc --noEmit`, `npm run build`, dan pemeriksaan manual pada browser. Catat penyebab jika sebuah gate gagal; jangan menutupinya dengan menghapus output galat.
- Perubahan UI diperiksa pada desktop dan mobile, mode terang dan gelap, keyboard, serta reduced motion. Gunakan [QA.md](QA.md) sebagai daftar uji.
- Prioritas teknis yang diketahui: celah login credentials pada akun OAuth, payload data URL di `/api/images`, dan halaman hasil yang belum ada. Signature parameter route dinamis Next.js 15 telah disesuaikan pada handoff ini. Rincian ada di [HANDOFF.md](HANDOFF.md).
