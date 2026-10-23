# Rencana Frontend Core R — `core-r-fe`

**Proyek:** `core-r-fe`  
**Status:** Penyiapan fondasi sedang berlangsung  
**Tujuan:** Boilerplate frontend admin Vue yang dapat digunakan ulang dan mengikuti kontrak API Core R.

## 1. Tujuan proyek

`core-r-fe` adalah boilerplate admin yang dapat digunakan kembali, bukan dashboard sekali pakai. Fondasi yang ingin disediakan:

- Kerangka aplikasi dan sistem desain yang konsisten.
- Autentikasi dan navigasi yang mengikuti izin pengguna.
- Klien API terpusat.
- Tipe API dan fungsi endpoint yang dibuat dari kontrak OpenAPI backend.
- Pola CRUD yang dapat digunakan ulang, termasuk tampilan memuat, kosong, validasi, dan kesalahan.
- Pengujian, pemeriksaan tipe, lint, serta dokumentasi.

## 2. Keputusan teknologi

| Area | Pilihan |
|---|---|
| Framework | Vue 3 |
| Bahasa pemrograman | TypeScript |
| Build tool | Vite |
| Pustaka UI | PrimeVue 4 |
| Tema | PrimeVue Aura |
| Ikon | PrimeIcons |
| Routing | Vue Router |
| State bersama | Pinia |
| HTTP client | Axios |
| Kontrak dan pembuatan klien API | OpenAPI + Orval |
| Validasi formulir/batas data | Zod |
| Bahasa antarmuka | Vue I18n (`id`, `en`) |
| Pengujian unit/komponen | Vitest + Vue Test Utils |
| Pengujian end-to-end | Playwright |
| Kualitas kode | ESLint, Oxlint, Prettier |
| Arsitektur | Berbasis fitur/modul |

Daftar navigasi didefinisikan di frontend, lalu disaring berdasarkan izin yang diberikan backend. Pemeriksaan rute di frontend membantu pengalaman pengguna; backend tetap menjadi sumber otoritatif untuk keamanan dan otorisasi.

## 3. Status implementasi saat ini

### Hal yang sudah dikonfirmasi

- Proyek dibuat menggunakan `npm create vue@latest`.
- TypeScript, Vue Router, Pinia, Vitest, Playwright, ESLint, dan Prettier dipilih saat pembuatan proyek.
- PrimeVue, `@primevue/themes`, PrimeIcons, Axios, Zod, dan Vue I18n sudah dipasang.
- Orval sudah dipasang sebagai dependensi pengembangan.
- `orval.config.ts` dikonfigurasi untuk membaca `OPENAPI_URL` dari `.env`.
- Orval berhasil membuat berkas:
  - `src/api/generated/core-r.ts`
  - `src/api/generated/models/*`
- `package.json` sebelumnya dilaporkan memiliki skrip `api:generate` dan `api:update`; periksa definisi terakhir di folder kerja sebelum mengandalkannya.
- `.env` dan `.env.example` sudah tersedia. `.env` berisi konfigurasi lokal dan tidak boleh di-commit.

### Hal yang masih harus diperiksa atau dikerjakan

- Pastikan `.gitignore` mengecualikan `.env`.
- Pastikan perilaku `api:update` sesuai tujuan dan tidak mengulang proses pembuatan tanpa kebutuhan.
- Konfigurasikan PrimeVue 4 dan tema Aura pada titik masuk aplikasi.
- Buat Axios client bersama yang menggunakan `VITE_API_BASE_URL`.
- Pastikan fungsi API hasil generasi memakai konfigurasi Axios dan autentikasi yang diinginkan.
- Implementasikan autentikasi, route guard, layout, dan modul.
- Jalankan pemeriksaan tipe, pengujian, lint, dan build produksi.

### Node.js

Rentang versi Node yang tercantum di proyek adalah `^22.18.0 || >=24.12.0`. Gunakan Node 24 untuk proyek ini dan tambahkan `.nvmrc` berisi `24` jika berkas tersebut belum ada.

```sh
nvm use
```

Simpan `package-lock.json` di Git agar pemasangan dependensi dapat diulang dengan hasil yang konsisten.

## 4. Alur kerja API berbasis kontrak

### Sumber acuan

Spesifikasi OpenAPI dari backend Core R menjadi sumber acuan untuk kontrak request/response dan operasi endpoint. Nilai konfigurasi lokal yang telah dibahas:

```dotenv
VITE_API_BASE_URL=https://core-r.p85.test:8443/api
OPENAPI_URL=https://core-r.p85.test:8443/docs/api.json
```

Periksa rute OpenAPI yang benar pada backend jika ada perubahan. README backend juga pernah mendokumentasikan `/docs/api/openapi.json`; jangan menganggap kedua alamat tersebut sama tanpa memeriksa konfigurasi backend yang sedang aktif.

Nilai `VITE_*` akan dimasukkan ke kode browser dan tidak boleh berisi rahasia. `OPENAPI_URL` digunakan oleh konfigurasi Orval yang berjalan di Node.js dan tidak diekspos ke browser, kecuali secara eksplisit disalin ke variabel `VITE_*`.

### Proses pembuatan kode

Alur yang diharapkan:

1. Backend mengubah rute, skema request/response, atau metadata operasi.
2. Perbarui atau buat ulang kontrak OpenAPI sesuai kebutuhan backend.
3. Jalankan Orval dari proyek frontend.
4. Tinjau perubahan kode hasil generasi dan perbarui layanan/antarmuka fitur jika perilakunya berubah.
5. Jalankan pemeriksaan tipe dan pengujian.

Perintah yang berguna:

```sh
npm run api:generate
npm run type-check
npm run build
```

Jika `api:update` sudah dikonfigurasi untuk menjalankan urutan sinkronisasi dan generasi yang benar, gunakan:

```sh
npm run api:update
```

Hindari mengambil kontrak dari backend setiap kali build produksi dijalankan. Agar build dapat diulang secara konsisten, pertimbangkan menyimpan snapshot OpenAPI yang sudah ditinjau atau menjadikan sinkronisasi kontrak sebagai langkah eksplisit pada proses pengembangan/CI. Tentukan apakah berkas OpenAPI dan hasil generasinya disimpan di Git, lalu dokumentasikan kebijakan tersebut secara konsisten.

### Sertifikat TLS untuk pengembangan lokal

Sebelumnya Orval gagal karena Node.js tidak dapat memverifikasi sertifikat HTTPS lokal. Proses generasi kemudian berhasil. Dokumentasikan cara mengatasi sertifikat hanya jika masih dibutuhkan. Utamakan mempercayai CA lokal yang benar atau menggunakan dukungan CA sistem dari Node.js, misalnya:

```sh
NODE_OPTIONS=--use-system-ca npm run api:generate
```

Jangan menjadikan `NODE_TLS_REJECT_UNAUTHORIZED=0` sebagai solusi rutin karena variabel tersebut menonaktifkan verifikasi sertifikat TLS untuk proses Node.js.

### Batas kemampuan kode hasil generasi

Orval membuat model TypeScript dan fungsi endpoint/klien dari OpenAPI. Orval **tidak** otomatis membuat halaman admin siap pakai, alur bisnis, keputusan navigasi, atau tata letak formulir. Di masa mendatang, alat pembuat kerangka modul khusus dapat memanfaatkan tag OpenAPI, `operationId`, metode HTTP, serta metadata frontend tambahan. Hasilnya tetap perlu ditinjau oleh pengembang.

## 5. Struktur direktori yang direncanakan

Tambahkan berkas saat fase terkait mulai dikerjakan; jangan membuat seluruh struktur sekaligus tanpa kebutuhan.

```text
core-r-fe/
├── openapi/
│   └── core-r.json                 # snapshot OpenAPI yang sudah ditinjau (opsional)
├── src/
│   ├── app/
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── registerPlugins.ts
│   ├── api/
│   │   ├── client.ts               # instance Axios bersama
│   │   ├── api-error.ts
│   │   └── generated/              # keluaran Orval; jangan diedit manual
│   │       ├── core-r.ts
│   │       └── models/
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   └── shared/
│   ├── layouts/
│   │   ├── AuthLayout.vue
│   │   └── DashboardLayout.vue
│   ├── modules/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── roles/
│   │   ├── permissions/
│   │   ├── settings/
│   │   ├── notifications/
│   │   └── audit/
│   ├── router/
│   ├── stores/
│   ├── config/
│   ├── composables/
│   ├── i18n/
│   ├── types/
│   ├── utils/
│   └── styles/
├── .env.example
├── .nvmrc
├── orval.config.ts
├── package.json
└── README.md
```

### Tanggung jawab direktori

- `api/generated/`: hanya berisi keluaran generasi; jangan mengedit berkasnya secara manual.
- `api/client.ts`: konfigurasi Axios bersama, alamat dasar, bahasa, header autentikasi, dan interceptor.
- `modules/`: halaman, komponen, store, serta logika antarmuka untuk setiap fitur.
- `config/navigation.ts`: daftar navigasi yang dikelola frontend beserta izin yang dibutuhkan.
- `components/shared/`: pola header halaman, dialog konfirmasi, tabel data, dan tampilan status umum.
- `i18n/`: teks antarmuka dalam Bahasa Indonesia dan Bahasa Inggris.

## 6. Arsitektur klien API dan autentikasi

Buat satu klien Axios bersama yang menggunakan `VITE_API_BASE_URL`. Klien tersebut perlu menangani secara terpusat:

- Header `Accept: application/json` dan `Accept-Language`.
- Penambahan Bearer token sesuai kontrak Core R yang telah dikonfirmasi.
- Penyeragaman bentuk kesalahan validasi, belum terautentikasi, tidak diizinkan, jaringan, dan server.
- Penanganan ID request/korelasi jika berguna untuk pelacakan.
- Penghindaran konfigurasi request yang berulang di setiap fitur.

Endpoint Core R yang pernah dibahas meliputi `POST /api/auth/login`, `GET /api/auth/me`, dan `GET /api/settings/public`. Alur login diperkirakan mengembalikan token Sanctum Bearer, tetapi periksa skema hasil generasi dan kontrak backend terbaru sebelum mengimplementasikan autentikasi.

Penyimpanan token merupakan keputusan keamanan. Jangan menganggap `localStorage` otomatis aman. Dokumentasikan strategi yang dipilih dan pertimbangkan risiko XSS. Jika memakai autentikasi berbasis cookie, konfigurasi CSRF dan CORS dengan benar.

## 7. Izin dan navigasi

- Definisikan item menu di kode frontend.
- Hubungkan rute/aksi dengan identitas izin dari backend.
- Ambil izin dari respons pengguna yang sedang masuk atau endpoint yang sudah dikonfirmasi.
- Saring navigasi dan lindungi rute berdasarkan izin tersebut.
- Jangan menganggap menu tersembunyi atau route guard frontend sebagai otorisasi. Endpoint backend tetap wajib memeriksa izin.
- Jangan mengarang identitas izin; gunakan kontrak backend dan konfigurasi/seeder yang benar.

## 8. Antarmuka dan bahasa

Gunakan PrimeVue 4 dengan Aura sebagai fondasi. Buat pola yang konsisten untuk:

- Header halaman dan breadcrumb.
- Input dan validasi.
- Dialog dan konfirmasi.
- Pesan toast.
- Tabel data dan pagination.
- Tampilan memuat, kosong, dan kesalahan.
- Navigasi responsif.

Gunakan Vue I18n dengan Bahasa Indonesia (`id`) sebagai bahasa awal dan Bahasa Inggris (`en`) sebagai bahasa kedua. Selaraskan penggunaan bahasa pada antarmuka frontend dengan perilaku `Accept-Language` pada backend, tetapi tetap perlakukan keduanya sebagai hal yang berbeda.

Gunakan Zod jika membantu validasi formulir atau pemeriksaan data yang belum tepercaya. Hindari menggandakan skema API secara tidak perlu jika tipe sudah tersedia dari OpenAPI.

## 9. Modul yang direncanakan

| Modul | Tanggung jawab awal | Prioritas |
|---|---|---|
| Auth | Login, logout, pengguna aktif, status sesi | P0 |
| Dashboard | Halaman awal dan integrasi layout | P0 |
| Users | Daftar dan CRUD jika didukung API | P1 |
| Roles | Pengelolaan role jika didukung | P1 |
| Permissions | Pemeriksaan/penetapan izin jika didukung | P1 |
| Settings | Pengaturan publik dan admin jika didukung | P1 |
| Notifications | Kotak masuk dan status sudah/belum dibaca jika didukung | P2 |
| Audit | Daftar dan filter jejak audit jika didukung | P2 |
| Files | Bantuan unggah/unduh jika diperlukan | P2 |

Prioritas menunjukkan urutan implementasi, bukan jaminan bahwa semua endpoint tersedia. Periksa operasi endpoint, skema, pagination, dan nama izin dari kontrak terbaru.

## 10. Tahapan implementasi

### Fase 1 — Fondasi dan PrimeVue

1. Periksa versi Node.js dan `.nvmrc`.
2. Tinjau `src/main.ts`, `src/App.vue`, router, dan konfigurasi Vite saat ini.
3. Daftarkan PrimeVue, Aura, PrimeIcons, Pinia, Router, dan Vue I18n tanpa menghapus konfigurasi yang sudah ada.
4. Siapkan gaya global dan metadata aplikasi.
5. Tambahkan halaman kecil untuk menguji komponen UI.
6. Jalankan pemeriksaan tipe dan build produksi.

**Kriteria selesai:** aplikasi dapat dijalankan, komponen PrimeVue tampil, Router/Pinia berfungsi, dan build berhasil.

### Fase 2 — OpenAPI dan fondasi API

1. Verifikasi `OPENAPI_URL` dan alamat OpenAPI Core R yang aktif.
2. Pastikan konfigurasi Orval dan skrip dapat dijalankan secara konsisten.
3. Putuskan apakah snapshot OpenAPI yang sudah ditinjau dan hasil generasi akan disimpan di Git.
4. Buat klien Axios bersama dengan `VITE_API_BASE_URL`.
5. Konfigurasikan header bahasa dan penyeragaman kesalahan API.
6. Pastikan HTTPS lokal, CORS, dan konektivitas API berfungsi.

**Kriteria selesai:** Orval dapat membuat ulang tipe/fungsi klien, dan satu endpoint nyata dapat dipanggil melalui klien bersama.

### Fase 3 — Autentikasi dan izin

1. Konfirmasikan kontrak login dan `/auth/me`.
2. Implementasikan layanan autentikasi dan store Pinia.
3. Implementasikan login dan logout.
4. Implementasikan pemulihan sesi berdasarkan strategi penyimpanan yang dipilih.
5. Tambahkan route guard dan helper izin.
6. Uji perilaku pengguna yang belum login dan pengguna yang tidak memiliki izin.

**Kriteria selesai:** login berfungsi terhadap backend nyata dan navigasi yang dilindungi berperilaku sesuai aturan.

### Fase 4 — Kerangka aplikasi

1. Buat layout autentikasi dan dashboard.
2. Implementasikan sidebar, header, breadcrumb, dan perilaku responsif.
3. Tambahkan daftar navigasi dan penyaringan berdasarkan izin.
4. Tambahkan pengalih bahasa.
5. Integrasikan pengaturan publik dan nama aplikasi.

**Kriteria selesai:** layout responsif untuk pengguna terautentikasi dan navigasi berbasis izin berfungsi.

### Fase 5 — UI yang dapat digunakan ulang dan CRUD pertama

1. Tetapkan pola tabel dan pagination.
2. Tetapkan validasi formulir dan tampilan kesalahan API.
3. Tambahkan pola konfirmasi dan toast.
4. Tambahkan tampilan memuat, kosong, dan kesalahan.
5. Bangun satu modul CRUD nyata dari awal sampai akhir.
6. Ambil pola yang benar-benar terbukti dapat digunakan ulang.

**Kriteria selesai:** modul CRUD sederhana kedua dapat menggunakan pola yang sudah dibuat.

### Fase 6 — Modul administrasi

Implementasikan Users, Roles/Permissions, Settings, Notifications, Audit, dan bantuan berkas sesuai dukungan yang benar-benar tersedia di backend.

**Kriteria selesai:** setiap modul menggunakan tipe/fungsi API hasil generasi, perilaku Axios bersama, aturan izin, pola UI, dan pengujian.

### Fase 7 — Kualitas dan kesiapan rilis

1. Tambahkan pengujian unit untuk store, helper, validasi, dan komponen.
2. Tambahkan pengujian Playwright untuk login, rute terlindungi, dan alur CRUD.
3. Tambahkan skrip pemeriksaan lint/format yang tidak mengubah berkas.
4. Verifikasi build produksi dan penanganan environment.
5. Dokumentasikan pemasangan, sinkronisasi/generasi API, izin, dan pembuatan modul.
6. Tinjau versi serta lisensi dependensi sebelum boilerplate dibagikan.

**Kriteria selesai:** build dan pemeriksaan bersih, penyiapan terdokumentasi, dan pengujian dapat dijalankan berulang kali.

## 11. Strategi pengujian

Gunakan Vitest dan Vue Test Utils untuk menguji helper izin, perubahan status autentikasi, penyeragaman kesalahan API, validasi, penyaringan navigasi, dan komponen bersama.

Gunakan Playwright untuk menguji login berhasil/gagal, rute terlindungi, navigasi berbasis izin, logout, serta satu alur CRUD utama.

Gunakan kredensial uji dan data yang terisolasi. Jangan pernah menyimpan rahasia di dalam pengujian atau `.env.example`.

## 12. Persyaratan keamanan dan operasional

- Otorisasi backend adalah sumber keputusan utama.
- Jangan menaruh rahasia di variabel `VITE_*`.
- Pastikan `.env` diabaikan oleh Git; commit hanya contoh konfigurasi yang aman.
- Jangan mengedit berkas hasil generasi Orval secara manual.
- Bedakan penanganan kesalahan `401`, `403`, validasi, jaringan, dan server.
- Verifikasi konfigurasi CORS dan HTTPS untuk pengembangan lokal.
- Hindari mencatat token atau data pengguna yang sensitif ke log.
- Hindari merender HTML yang belum tepercaya.
- Jaga konsistensi lockfile dan versi dependensi.
- Jangan menonaktifkan verifikasi TLS secara global sebagai solusi rutin.

## 13. Kriteria selesai untuk rilis pertama

- [ ] Versi Node.js dan pemasangan dependensi dapat diulang secara konsisten.
- [ ] `.env` diabaikan Git dan `.env.example` tidak berisi rahasia.
- [ ] PrimeVue/Aura sudah dikonfigurasi.
- [ ] Router dan Pinia berfungsi.
- [ ] Alur OpenAPI → Orval terdokumentasi dan dapat dijalankan ulang.
- [ ] Klien API membaca alamat dasar dari environment.
- [ ] Alur login dan pengguna aktif sesuai kontrak backend yang sebenarnya.
- [ ] Navigasi dan route guard berbasis izin berfungsi.
- [ ] Layout admin responsif selesai.
- [ ] Minimal satu modul CRUD menunjukkan pola yang dapat digunakan ulang.
- [ ] Tampilan memuat, kosong, validasi, dan kesalahan konsisten.
- [ ] Pengujian unit dan satu alur penting Playwright berhasil.
- [ ] Pemeriksaan tipe dan build produksi berhasil.
- [ ] README menjelaskan penyiapan, generasi API, dan penambahan modul.

## 14. Langkah berikutnya

1. Pastikan `.gitignore` mengecualikan `.env`.
2. Tinjau `src/main.ts`, `src/App.vue`, `src/router/index.ts`, dan `vite.config.ts`.
3. Konfigurasikan PrimeVue 4 dan Aura tanpa menimpa konfigurasi Router/Pinia yang sudah ada.
4. Verifikasi skrip `api:generate` dan `api:update`.
5. Buat klien Axios bersama.
6. Jalankan pemeriksaan tipe dan build.
7. Pastikan skema request/response autentikasi benar sebelum mengimplementasikan login.

**Prinsip kerja:** bangun fondasi kecil yang lengkap dan teruji terlebih dahulu. Gunakan kontrak OpenAPI backend sebagai acuan untuk tipe dan operasi endpoint; bangun antarmuka yang sesungguhnya secara sengaja di atas fondasi tersebut.
