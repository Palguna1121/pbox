# Handoff proyek PBOX

Dokumen ini menggambarkan kode pada 29 September 2026. Repositori memiliki perubahan kerja yang belum dikomit saat peninjauan, sehingga gunakan isi kode dan `git status` terbaru sebagai sumber kebenaran ketika melanjutkan pekerjaan. Belum ada bukti deployment produksi atau pengujian alur kamera secara langsung pada perangkat dalam handoff ini. Peta sistem lebih rinci ada di [ARCHITECTURE.md](ARCHITECTURE.md), acuan UI di [DESIGN.md](DESIGN.md), dan hasil pemeriksaan di [QA.md](QA.md).

## Gambaran produk

PBOX menyediakan tiga alur: **Photobox** (foto dengan frame), **Sticker Pic** (foto dengan stiker), dan **Formal Pic** (foto dengan latar dan ukuran yang dipilih). Katalog dapat dilihat tanpa login. `/dashboard`, `/profile`, dan `/settings` memerlukan sesi; halaman `/admin/*` memerlukan peran `admin`. Halaman `/camera` saat ini dapat dibuka tanpa sesi.

Alur pengguna saat ini:

1. Pengguna melihat katalog di `/photobox`, `/sticker-pic`, atau `/formal-pic` dan membuka `/camera?type=frame|sticker|formal`.
2. `src/components/camera/Camera.tsx` meminta izin kamera browser dan mengambil foto setelah hitung mundur.
3. `src/app/camera/page.tsx` memilih frame atau latar formal bila perlu, lalu memanggil `FrameEditor`, `StickerEditor`, atau `FormalEditor`. Editor menghasilkan data URL PNG dari canvas.
4. Tombol simpan memanggil `POST /api/images`; API mengunggah gambar ke ImageKit dan membuat baris `Image` di PostgreSQL. Setelah itu halaman kamera menampilkan tautan **Lihat Hasil**.

Katalog formal adalah latar gambar yang digambar di canvas lalu ditimpa foto pengguna. Tidak ada segmentasi subjek atau penghapusan latar otomatis pada alur ini.

## Peta kode dan data

| Area | Lokasi | Peran |
| --- | --- | --- |
| Halaman publik dan akun | `src/app/` | Landing page, katalog, kamera, dashboard, profil, pengaturan, admin |
| Editor kamera | `src/components/camera/` | Capture, komposisi frame/stiker/formal pada canvas |
| API | `src/app/api/` | Auth, katalog, upload, statistik, pengaturan akun, upscale |
| Auth dan penjagaan halaman | `src/lib/auth.ts`, `src/middleware.ts` | NextAuth credentials/Google, JWT, peran `admin`, redirect halaman |
| Database | `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts` | Skema, migrasi awal, data contoh |
| Penyimpanan gambar | `src/lib/imagekit.ts`, `src/lib/catalog-assets.ts`, `src/app/api/files/route.ts`, `src/app/api/images/route.ts` | Upload aset admin dan hasil foto; pemetaan aset lokal seed |
| Upscaling | `src/lib/python-bridge.ts`, `src/app/api/upscale/route.ts`, `src/python/upscaler.py` | Implementasi terpisah yang belum tersambung dengan benar |
| Infrastruktur lokal | `compose.yaml`, `SETUP.md` | PostgreSQL lokal dan langkah instalasi |

Relasi data utama: `Category` memiliki banyak `FrameCatalog` dan `StickerCatalog`; `FrameCatalog` memiliki `FramePlaceholder` berisi koordinat area foto. `FormalPicture` menyimpan URL latar dan daftar ukuran dalam JSON. `Image` menyimpan URL hasil, `type`, dan `itemId`; model ini **tidak** menyimpan `userId`. `User`, `Account`, `Session`, dan `VerificationToken` mendukung autentikasi. Detail kolom dan penghapusan berantai ada di `prisma/schema.prisma`.

Seed membuat satu admin, lima akun contoh, lima kategori, 20 frame, 20 stiker, dan lima latar formal. Seed baru menunjuk ke 45 aset lokal; file dan cara pembuatannya ada di [ASSETS.md](ASSETS.md). Database yang sudah berisi URL `placehold.co` ditangani saat dibaca oleh `src/lib/catalog-assets.ts` untuk entri seed yang dikenal. `scripts/backfill-catalog-assets.mjs` tersedia untuk mengganti URL lama secara permanen ketika database dapat diakses. Frame seed juga diberi placeholder; formulir admin untuk frame baru saat ini hanya mengirim nama, kategori, dan gambar, tanpa pengaturan placeholder.

## Konfigurasi dan menjalankan lokal

Ikuti [SETUP.md](../SETUP.md). Jalur yang dipakai dokumen ini adalah npm. `bun.lock` juga ada di repositori, tetapi pilih satu alur pengelolaan dependensi untuk pekerjaan berikutnya. Pada awal peninjauan `package-lock.json` belum mencantumkan `next-themes`; instalasi Motion dalam sesi ini menyinkronkan daftar dependensi langsung pada lockfile npm. `compose.yaml` menyediakan PostgreSQL 15 di port host `5433` dengan volume persisten.

| Variabel | Dipakai oleh | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | Prisma | Koneksi PostgreSQL, lokal melalui `localhost:5433` |
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | NextAuth | URL aplikasi dan rahasia sesi |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | `src/lib/auth.ts` | Login Google; redirect URI lokal `/api/auth/callback/google` |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | ImageKit | Kunci publik |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit server | Kunci privat; jangan gunakan prefiks `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | ImageKit dan halaman | Endpoint media |

`SETUP.md` versi sebelumnya mencantumkan `NEXT_PUBLIC_IMAGEKIT_ID`, tetapi kode saat ini tidak membacanya. Tidak ada `.env.example` di repositori; buat `.env` lokal secara manual dan jangan masukkan nilainya ke Git. Untuk deployment, sediakan PostgreSQL, variabel di atas, dan akses jaringan ke ImageKit; Geist kini dimuat dari paket lokal `geist`. Belum ada konfigurasi hosting produksi di repo. `next/image` saat ini mengizinkan host `ik.imagekit.io` dan `placehold.co` di `next.config.ts`.

Seed berisi kredensial contoh yang diketahui publik (`admin@gmail.com` / `password` dan akun `@example.com` / `password123`). Gunakan seed hanya pada database pengembangan; sebelum memublikasikan aplikasi, ganti atau hapus akun contoh dan kelola admin secara aman.

## Peta halaman dan API

| Halaman | Fungsi dan akses |
| --- | --- |
| `/`, `/photobox`, `/photobox/[id]`, `/sticker-pic`, `/sticker-pic/[id]`, `/formal-pic` | Landing dan katalog publik |
| `/camera?type=frame|sticker|formal` | Capture dan editor; belum dijaga middleware |
| `/login`, `/register` | Masuk atau daftar |
| `/dashboard`, `/profile`, `/settings` | Sesi pengguna diperlukan |
| `/admin/home`, `/admin/categories`, `/admin/frame-catalog`, `/admin/sticker-catalog` | Admin, termasuk halaman detail/buat/edit katalog |

| API | Metode | Akses saat ini |
| --- | --- | --- |
| `/api/auth/[...nextauth]`, `/api/auth/register` | Auth NextAuth; `POST` registrasi | Publik |
| `/api/categories`, `/api/categories/[id]` | `GET` keduanya; `POST` daftar; `PATCH`/`DELETE` item | Baca publik, ubah admin |
| `/api/frame-catalog`, `/api/frame-catalog/[id]` | `GET` keduanya; `POST` daftar; `PATCH`/`DELETE` item | Baca publik, ubah admin |
| `/api/sticker-catalog`, `/api/sticker-catalog/[id]` | `GET` keduanya; `POST` daftar; `PATCH`/`DELETE` item | Baca publik, ubah admin |
| `/api/frames/[id]`, `/api/stickers/[id]`, `/api/formal-pictures`, `/api/formal-picture/[id]` | `GET` detail/editor atau daftar formal | Publik |
| `/api/files` | `POST` multipart upload aset katalog | Admin |
| `/api/images` | `POST` upload hasil foto dan simpan metadata | Publik; belum ada `GET` |
| `/api/user/update-name`, `/api/user/update-password` | `PATCH` | Pengguna login |
| `/api/admin/stats` | `GET` | Admin |
| `/api/upscale` | `POST` | Publik; integrasi belum siap |

Halaman admin memakai API untuk mutasi katalog. `src/middleware.ts` membatasi **halaman** yang tercantum pada matchernya; otorisasi API dilakukan di route handler masing-masing. Perubahan endpoint baru perlu memeriksa sesi/peran di handler.

## Status verifikasi handoff

- `./node_modules/.bin/tsc --noEmit` lulus setelah signature `params` handler/halaman dinamis disesuaikan dengan Next.js 15.
- `npm run build` lulus: kompilasi, pemeriksaan tipe, dan pembuatan 33 halaman statis selesai. Geist dimuat dari paket lokal; halaman login memiliki batas Suspense untuk `useSearchParams`.
- `npm run lint` membuka wizard konfigurasi ESLint dan keluar dengan status 1; lint belum menjadi pemeriksaan otomatis yang siap dipakai.
- Next dev merespons `GET /` dengan HTTP 200. Browser UI tidak tersedia pada sesi ini, jadi tampilan dan interaksi belum tervalidasi secara visual.
- Build berhasil membaca katalog dari database lokal. Seed, login, upload ImageKit, kamera browser, dan deployment **belum diuji langsung** dalam handoff ini.

Pembaruan 30 September 2026: seluruh aset contoh katalog kini tersedia lokal dan URL seed baru sudah diarahkan ke sana. Saat sesi pembaruan aset, koneksi database tidak tersedia untuk backfill; resolver baca menjaga entri seed lama tetap memakai aset lokal. TypeScript lulus, tetapi build sesi ini berhenti pada worker pembuatan halaman statis setelah kompilasi. Rincian pemeriksaan terbaru ada di [QA.md](QA.md#pemeriksaan-aset-katalog-30-september-2026).

## Batasan dan pekerjaan lanjutan

1. **Login credentials akun Google perlu diamankan.** Di `src/lib/auth.ts`, `authorize()` hanya membandingkan password ketika `user.password` berisi nilai. Akun OAuth dengan `password: null` dapat dikembalikan sebagai pengguna yang berhasil login lewat credentials jika emailnya diketahui dan sebuah password dikirim. Perbaiki kondisi ini sebelum aplikasi terbuka untuk pengguna lain.
2. **Simpan hasil foto perlu diperiksa.** Editor mengirim data URL (`data:image/png;base64,...`), sedangkan `/api/images` langsung menjalankan `Buffer.from(image, "base64")`. Prefix data URL belum dipisahkan, sehingga payload yang diunggah berisiko bukan gambar yang benar. Endpoint itu juga meminta ekstensi ImageKit `google-auto-tagging`; pastikan akun ImageKit mendukungnya. Verifikasi hasil file yang benar-benar dapat dibuka.
3. **Halaman hasil belum ada.** Kamera menautkan ke `/result?images=...`, tetapi tidak ada `src/app/result/page.tsx`. Model `Image` juga tidak berelasi dengan `User`; belum ada galeri hasil per akun.
4. **Upscale belum tersambung.** `/api/upscale` mencari `python/upscaler.py` dari root proyek, sedangkan berkasnya berada di `src/python/upscaler.py`. Skrip Python kemudian mencari model di `src/public/models/`, sementara model berada di `public/models/`. Komponen yang memanggilnya, `src/components/PhotoCapture.tsx`, tidak dipakai oleh alur kamera saat ini.
5. **Izin dan pembatasan upload perlu ditentukan.** `/api/images` dan `/api/upscale` menerima POST tanpa sesi; belum tampak pembatasan ukuran file, laju permintaan, atau kepemilikan hasil. Putuskan kebijakan publik/akun sebelum produksi.
6. **Konten baru perlu konfigurasi editor.** Admin dapat membuat frame, tetapi UI admin tidak menyediakan penempatan `FramePlaceholder`; tanpa placeholder, komposisi frame perlu dicek. Katalog formal baru hanya datang dari seed karena belum ada halaman admin untuk mengelolanya.
7. **Validasi rilisan belum lengkap.** Build dan TypeScript telah lulus, tetapi lint noninteraktif dan alur login, katalog, kamera, simpan, serta hasil di browser berkamera masih perlu diuji. Pastikan URL ImageKit dapat dipakai canvas lintas origin dan host media baru ditambahkan ke `next.config.ts` bila diperlukan.

## Titik lanjut untuk penerus

Mulai dari `git status` untuk memahami perubahan kerja yang belum dikomit, lalu jalankan setup lokal. Amankan login credentials, kemudian validasi alur foto dari capture sampai file hasil yang dapat dibuka. Setelah itu selesaikan halaman hasil dan putuskan apakah foto harus terkait akun. Semua temuan di atas bersumber dari pembacaan kode dan hasil perintah pada saat handoff, bukan klaim bahwa semua alur sudah berjalan di lingkungan produksi.
