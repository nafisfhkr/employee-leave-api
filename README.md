# Employee Leave Management API

RESTful API  yang dirancang untuk mengelola sistem pengajuan dan manajemen cuti karyawan secara aman, terstruktur, dan efisien. Proyek ini dibangun menggunakan **AdonisJS v5 (TypeScript)** dan **PostgreSQL** .

## 🔗 Dokumentasi API Publik
Seluruh rancangan endpoint, skema payload request, headers, serta visualisasi contoh respons (sukses & gagal) telah diterbitkan dan dapat diakses secara interaktif melalui tautan berikut:
**[Published Postman Documentation](https://documenter.getpostman.com/view/54082264/2sBXwqsAyn)**

---

## Penjelasan Arsitektur Sistem

Aplikasi ini menerapkan prinsip **Clean Architecture** dan **Separation of Concerns (SoC)** secara ketat untuk memisahkan tanggung jawab kode ke dalam beberapa lapisan independen. Pendekatan ini menjamin kode bersifat *highly testable*, modular, mudah dirawat (*maintainable*), dan terhindar dari *spaghetti code*.

### 📂 Struktur Direktori Pemetaan Arsitektur
```text
employee-leave-api
├── app
│   ├── Controllers      
│   │   └── Http
│   ├── Middleware       
│   ├── Models           
│   ├── Services         
│   └── Validators       
├── database
│   ├── migrations       
│   └── seeders           
└── start
    └── routes.ts         

```

### Siklus Aliran Data

Setiap request HTTP yang masuk ke server wajib melewati tahapan berlapis berikut sebelum akhirnya menyentuh database:

```text
[HTTP Request] 
      │
      ▼
 1. Routes (start/routes.ts) ──► Melakukan routing berdasarkan HTTP Method & URL
      │
      ▼
 2. Auth Middleware ───────────► Memvalidasi keabsahan JWT (access_token)
      │
      ▼
 3. RoleGuard Middleware ──────► Memverifikasi hak akses pengguna (Admin/Employee)
      │
      ▼
 4. Validators (DTO) ──────────► Validasi tipe data, format tanggal, dan batas ukuran file
      │
      ▼
 5. Controllers ───────────────► Mengurai parameter HTTP dan memetakan ke fungsi Service
      │
      ▼
 6. Services (Business Logic) ─► Mengeksekusi transaksi DB, kalkulasi jatah cuti, upload file
      │
      ▼
 7. Models (Lucid ORM) ────────► Abstraksi query aman menuju database PostgreSQL
      │
      ▼
[PostgreSQL Database]

```

---

##  Penjelasan Detail Fitur Kompleks

### 1. Kontrol Konkurensi: Database Transaction & Pessimistic Locking (`FOR UPDATE`)

Pada sistem manajemen jatah cuti, kerentanan terbesar terletak pada kondisi **Race Condition**. Kondisi ini terjadi jika dua proses admin menekan tombol *Approve* secara bersamaan pada dua pengajuan cuti berbeda dari satu karyawan yang sama, yang berpotensi mengakibatkan jatah cuti berkurang melebihi batas (minus) atau tidak akurat (*dirty write*).

Untuk menyelesaikan kompleksitas ini, sistem mengimplementasikan kombinasi dua teknik:

* **Database Transactions (`Database.transaction()`)**: Menjamin pemenuhan sifat **ACID (Atomicity, Consistency, Isolation, Durability)**. Jika proses pemotongan kuota cuti berhasil tetapi proses pembaruan status pengajuan gagal, maka seluruh rangkaian operasi database akan otomatis dibatalkan secara total (*Rollback*).
* **Pessimistic Locking (`.forUpdate()`)**: Saat Admin memproses pengajuan cuti, sistem akan melakukan *query* ke tabel `users` dengan menyertakan perintah `FOR UPDATE` di tingkat PostgreSQL. Ini akan **mengunci baris data karyawan tersebut secara eksklusif**. Antrean proses lain yang mencoba mengubah data karyawan yang sama akan dipaksa menunggu hingga transaksi pertama melakukan *Commit* atau *Rollback*.

### 2. Rotasi Token Otentikasi Ganda & Penanganan Google OAuth2

Sistem keamanan otentikasi dirancang tangguh dengan mengintegrasikan dua jalur:

* **Conventional JWT dengan Token Rotation**: Mengurangi risiko eksploitasi pencurian token dengan menerapkan masa kedaluwarsa yang singkat pada `access_token` dan menyediakan endpoint `/auth/refresh` untuk memperbarui sesi menggunakan `refresh_token` yang valid.
* **Single Sign-On (SSO) Google Ally**: Memanfaatkan protokol OAuth2 native lewat paket `@adonisjs/ally`. Sistem mengamankan aliran data callback menggunakan pengecekan kode `state` secara internal untuk menangkal serangan *Cross-Site Request Forgery (CSRF)* selama proses jabat tangan (*handshake*) dengan server Google.

### 3. Ketahanan Sistem Terhadap Edge Cases & Serangan Injeksi

* **Proteksi SQL Injection (SQLi)**: Seluruh pencarian data berbasis filter (seperti penyaringan status cuti oleh admin) menggunakan *Parameterized Queries* bawaan Lucid ORM. Input berbahaya seperti `pending' OR 1=1` tidak akan pernah dieksekusi sebagai perintah SQL, melainkan dievaluasi murni sebagai string data statis biasa.
* **Graceful Error Handling pada Pagination**: Lapisan *Service* dan *ORM* dikonfigurasi secara mandiri untuk menangani anomali parameter halaman. Jika pengguna mengirimkan nilai minus (`?page=-1`) atau limit bernilai nol (`?limit=0`), sistem tidak akan memuntahkan error fatal berstatus 500, melainkan mengoreksinya secara anggun dan mengembalikan struktur data JSON kosong berstatus 200 OK.

---

## 🛠️ Panduan Instalasi dan Setup Lokal

### 1. Kebutuhan Perangkat Lunak Minimum

* Node.js (Versi LTS direkomendasikan,atau cari yang kompatible )
* PostgreSQL Database Server berjalan aktif
* Manajer Paket (pnpm / npm / yarn)

### 2. Langkah-Langkah Instalasi

Kloning repositori ini ke komputer lokal Anda:

```bash
git clone <url-repositori-github-kamu>
cd employee-leave-api

```

Instal seluruh paket dependensi proyek menggunakan pnpm (atau paket manajer pilihan Anda):

```bash
pnpm install

```

### 3. Konfigurasi Environment (`.env`)

Salin file template contoh konfigurasi `.env.example` menjadi file `.env` baru:

```bash
cp .env.example .env

```

Buka file `.env` tersebut menggunakan editor teks, kemudian sesuaikan variabel koneksi database PostgreSQL lokal Anda serta kredensial Google Cloud Console:

```env
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=Z6X_... # Otomatis terkonfigurasi
DRIVE_DISK=local

# Konfigurasi PostgreSQL Lokal
DB_CONNECTION=pg
PG_HOST=127.0.0.1
PG_PORT=5432
PG_USER=username_postgresql_kamu
PG_PASSWORD=password_postgresql_kamu
PG_DB_NAME=nama_database_kamu

# Konfigurasi Google OAuth2 (Google Cloud Console)
GOOGLE_CLIENT_ID=client_id_dari_google_console_kamu
GOOGLE_CLIENT_SECRET=client_secret_dari_google_console_kamu
GOOGLE_CALLBACK_URL=callback anda

```

### 4. Eksekusi Skema Database (Migration & Seeder)

Jalankan migrasi untuk menyuntikkan seluruh struktur tabel, relasi, tipe data UUID, dan batasan (*constraints*) ke dalam PostgreSQL:

```bash
node ace migration:run

```

Jalankan seeder untuk memasukkan data master awal serta akun administrator penguji ke sistem:

```bash
node ace db:seed

```

### 5. Menjalankan Server Pengembang

Aktifkan server lokal AdonisJS dalam mode pemantauan otomatis (*file watcher*):

```bash
node ace serve --watch

```

Server backend akan aktif berjalan penuh dan siap melayani request API di alamat: **`http://localhost:3333`**

---

*Nafis Fakhrudin*

```