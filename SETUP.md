# Setup & Instalasi Pbox

Panduan lengkap untuk menjalankan proyek **Pbox** di komputer baru dari awal.

---

## Prasyarat

Pastikan software berikut sudah terinstal:

| Software | Versi Minimum | Link |
|----------|--------------|------|
| Node.js | 20+ | https://nodejs.org |
| npm | 9+ | (bawaan Node.js) |
| Docker & Docker Compose | - | https://www.docker.com |
| Python | 3.9+ | https://python.org _(hanya jika integrasi upscaling akan diperbaiki)_ |
| Git | - | https://git-scm.com |

---

## 1. Clone Repositori

```bash
git clone <url-repositori>
cd pbox
```

---

## 2. Install Dependencies Node.js

```bash
npm install
```

---

## 3. Konfigurasi Environment Variables

Saat ini tidak ada `.env.example` di repositori. Buat file `.env` lokal secara manual:

```bash
touch .env
```

> Jangan masukkan `.env` atau kunci rahasia ke Git.

Isi variabel berikut di `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5433/pbox?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="isi-dengan-string-random-panjang"

# Google OAuth (opsional, untuk login dengan Google)
GOOGLE_CLIENT_ID="isi-dari-google-cloud-console"
GOOGLE_CLIENT_SECRET="isi-dari-google-cloud-console"

# ImageKit (untuk penyimpanan gambar)
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="public_xxxx"
IMAGEKIT_PRIVATE_KEY="private_xxxx"
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/id-kamu"
```

### Generate NEXTAUTH_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Salin hasilnya ke `NEXTAUTH_SECRET`.

### Mendapatkan Google OAuth Credentials

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru atau pilih yang sudah ada
3. Masuk ke **APIs & Services → Credentials**
4. Klik **Create Credentials → OAuth 2.0 Client IDs**
5. Pilih **Web Application**
6. Tambahkan ke **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Salin **Client ID** dan **Client Secret** ke `.env`

### Mendapatkan ImageKit Credentials

1. Daftar di [imagekit.io](https://imagekit.io)
2. Buka **Dashboard → Developer Options**
3. Salin **Public Key**, **Private Key**, dan **URL Endpoint** ke `.env`

---

## 4. Jalankan Database (PostgreSQL via Docker)

```bash
docker compose up -d
```

Perintah ini akan menjalankan PostgreSQL 15 di port **5433**.

Verifikasi container berjalan:

```bash
docker ps
```

Harus ada container bernama `pbox-db` dengan status `Up`.

---

## 5. Setup Database (Prisma)

### Buat tabel dari schema:

```bash
npx prisma migrate deploy
npx prisma generate
```

Repositori ini sudah memiliki migration awal di `prisma/migrations/`. Gunakan `migrate deploy` untuk menerapkannya pada database baru.

### Isi data awal (seed admin):

```bash
npx prisma db seed
```

Ini akan membuat akun admin default:

- **Email:** `admin@gmail.com`
- **Password:** `password`

> **Penting:** Seed ini juga membuat lima akun demo dengan password `password123` dan URL media contoh dari `placehold.co`. Gunakan seed hanya untuk pengembangan. Sebelum aplikasi dipublikasikan, ganti atau hapus akun contoh dan kelola admin secara aman.

---

## 6. Jalankan Development Server

```bash
npm run dev
```

Aplikasi berjalan di: **http://localhost:3000**

---

## 7. Status Upscaling

`requirements.txt` memuat dependensi Python untuk RealESRGAN. Integrasi `/api/upscale` saat ini menunjuk lokasi skrip yang tidak sesuai dengan struktur repo, dan skrip menunjuk lokasi model yang juga tidak sesuai. Menginstal dependensi Python saja belum membuat fitur ini berfungsi. Lihat [catatan handoff](docs/HANDOFF.md#batasan-dan-pekerjaan-lanjutan) sebelum mengaktifkannya.

---

## Akun Default Setelah Setup

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | password |

---

## Struktur Halaman

| URL | Deskripsi |
|-----|-----------|
| `/` | Landing page |
| `/login` | Halaman login |
| `/register` | Halaman registrasi |
| `/dashboard` | Dashboard user |
| `/profile` | Profil akun |
| `/settings` | Pengaturan akun (ubah nama & password) |
| `/photobox` | Katalog frame foto |
| `/sticker-pic` | Katalog sticker |
| `/formal-pic` | Foto formal dengan background |
| `/admin/home` | Dashboard admin (hanya admin) |
| `/admin/categories` | Kelola kategori (hanya admin) |
| `/admin/frame-catalog` | Kelola frame (hanya admin) |
| `/admin/sticker-catalog` | Kelola sticker (hanya admin) |

---

## Scripts yang Tersedia

```bash
npm run dev      # Jalankan development server (Turbopack)
npm run build    # Build untuk production
npm run start    # Jalankan production server
npm run lint     # Saat ini membuka wizard konfigurasi ESLint; belum siap sebagai gate otomatis
```

```bash
npx prisma studio          # Buka GUI database di browser
npx prisma migrate dev     # Buat migration baru (saat schema berubah)
npx prisma generate        # Generate ulang Prisma Client
```

---

## Troubleshooting

### Database tidak terhubung

Pastikan Docker berjalan dan container aktif:

```bash
docker compose up -d
docker ps
```

Cek `DATABASE_URL` di `.env` mengarah ke `localhost:5433`.

### Error saat `prisma migrate deploy`

Periksa `DATABASE_URL`, status container, dan log Prisma sebelum mengambil langkah lain. Migration awal sudah ada di repo; `db push` bukan pengganti otomatis untuk kegagalan migrasi.

### Login Google tidak berfungsi

Pastikan `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` sudah diisi di `.env` dan redirect URI sudah ditambahkan di Google Cloud Console.

### Gambar tidak tampil

Pastikan variabel `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` dan `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` sudah diisi dengan benar.
