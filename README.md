# core-r-fe

Boilerplate admin frontend Vue 3 untuk Core R — dapat digunakan ulang dan mengikuti kontrak API Core R.

## Stack

| Area | Pilihan |
|---|---|
| Framework | Vue 3 + TypeScript |
| Build tool | Vite |
| UI | PrimeVue 4 + Tema Aura + PrimeIcons |
| Routing | Vue Router |
| State | Pinia |
| HTTP client | Axios |
| API contract | OpenAPI + Orval |
| Validasi | Zod |
| i18n | Vue I18n (`id`, `en`) |
| Unit test | Vitest + Vue Test Utils |
| E2E test | Playwright |
| Linter | ESLint + Oxlint + Prettier |

## Prasyarat

- Node.js `^22.18.0 || >=24.12.0` (gunakan Node 24, lihat `.nvmrc`)
- `nvm` tersedia

```sh
nvm use
npm install
```

## Pengaturan environment

Salin `.env.example` ke `.env` dan sesuaikan nilainya:

```sh
cp .env.example .env
```

```dotenv
VITE_API_BASE_URL=https://core-r.p85.test:8443/api   # dibaca browser, jangan taruh secret
OPENAPI_URL=https://core-r.p85.test:8443/docs/api.json  # hanya untuk Orval di Node.js
```

`.env` **tidak boleh di-commit** — sudah dikecualikan di `.gitignore`.

## Perintah pengembangan

```sh
npm run dev          # dev server dengan hot-reload
npm run build        # type-check + build produksi
npm run type-check   # hanya pemeriksaan tipe
npm run lint         # oxlint + eslint (dengan --fix)
npm run format       # prettier
npm run test:unit    # vitest
npm run test:e2e     # playwright
```

## Generasi API dari OpenAPI

Orval membaca `OPENAPI_URL` dari `.env` dan menghasilkan tipe TypeScript serta fungsi Axios ke `src/api/generated/`.

```sh
npm run api:generate
```

Jangan edit file di `src/api/generated/` secara manual — file tersebut akan ditimpa saat generate ulang.

### TLS lokal

Jika Orval gagal karena sertifikat HTTPS lokal tidak dipercaya Node.js:

```sh
NODE_OPTIONS=--use-system-ca npm run api:generate
```

Jangan gunakan `NODE_TLS_REJECT_UNAUTHORIZED=0` sebagai solusi rutin.

## Arsitektur

```
src/
├── api/
│   ├── client.ts          # Axios shared client — base URL, auth header, error interceptor
│   └── generated/         # output Orval, jangan diedit manual
├── i18n/
│   ├── index.ts
│   └── locales/
│       ├── id.ts          # Bahasa Indonesia (default)
│       └── en.ts          # English
├── router/                # Vue Router
├── stores/                # Pinia stores
├── layouts/               # AuthLayout, DashboardLayout
├── modules/               # fitur: auth, dashboard, users, roles, ...
├── components/
│   ├── ui/
│   └── shared/
├── composables/
├── types/
├── utils/
├── config/
└── styles/
```

## Klien API

`src/api/client.ts` adalah satu-satunya instance Axios yang dipakai seluruh aplikasi. Sudah menangani:

- `Accept: application/json`
- `Accept-Language` sesuai locale aktif Vue I18n
- Bearer token dari `localStorage` (akan dimigrasi ke strategi aman saat auth diimplementasi)
- Interceptor error terpusat (siap diperluas untuk 401/403/validasi)

## Keamanan

- Jangan taruh secret di variabel `VITE_*` — nilai tersebut masuk ke bundle browser.
- `.env` dikecualikan Git. Commit hanya `.env.example`.
- Token auth saat ini disimpan di `localStorage` — rentan XSS. Akan dimigrasi ke httpOnly cookie + CSRF pada Fase 3.
- Otorisasi sesungguhnya ada di backend; route guard frontend hanya untuk UX.

## Progress implementasi

### ✅ Fase 1 — Fondasi (selesai)

- [x] Node.js engine `^22.18.0 || >=24.12.0`, `.nvmrc` berisi `24`
- [x] `.gitignore` mengecualikan `.env`
- [x] PrimeVue 4 + Aura terdaftar di `main.ts`
- [x] ToastService + ConfirmationService terdaftar
- [x] Vue I18n (`id`/`en`) terdaftar, locale default `id`
- [x] `src/api/client.ts` — Axios shared client
- [x] `App.vue` — `RouterView` + `Toast` + `ConfirmDialog`
- [x] Build produksi berhasil (exit 0)

### ✅ Fase 2 — OpenAPI dan fondasi API (selesai)

- [x] Verifikasi kontrak Orval: `getCoreRAPI(axiosInstance)` factory pattern
- [x] `src/api/index.ts` — export `api = getCoreRAPI(apiClient)` sebagai instance tunggal
- [x] Kontrak auth dikonfirmasi dari generated types:
  - `POST /api/auth/login` → `LoginRequest { email, password, device_name }` → `{ token, token_type, expires_at, user }`
  - `GET /api/auth/me` → `UserSuccessResponse` dengan `roles[]` dan `permissions[]`
- [x] Build produksi berhasil (exit 0)

### ✅ Fase 3 — Autentikasi dan izin (selesai)

- [x] `src/stores/auth.ts` — Pinia auth store: `login`, `logout`, `fetchCurrentUser`, `hasPermission`, `hasRole`, `hasAnyPermission`
- [x] Session restore otomatis di route guard (satu kali, dari `localStorage`)
- [x] `src/router/index.ts` — route guard `requiresAuth`, `requiresGuest`, `permission`
- [x] `src/modules/auth/views/LoginView.vue` — form login dengan error handling 401/422
- [x] `src/modules/dashboard/views/DashboardView.vue` — placeholder dashboard
- [x] `src/api/client.ts` — interceptor 401: clear token + redirect ke `/login`
- [x] i18n: tambah `invalidCredentials`, `welcome`
- [x] Build produksi berhasil (exit 0)

### 🔲 Fase 4 — Kerangka aplikasi

- [ ] Layout autentikasi dan dashboard
- [ ] Sidebar, header, breadcrumb, responsif
- [ ] Navigasi berbasis izin
- [ ] Pengalih bahasa

### 🔲 Fase 5 — UI reusable dan CRUD pertama

- [ ] Pola tabel, pagination, validasi formulir
- [ ] Dialog konfirmasi, toast, loading/empty/error state
- [ ] Satu modul CRUD penuh dari awal sampai akhir

### 🔲 Fase 6 — Modul administrasi

Users, Roles, Permissions, Settings, Notifications, Audit

### 🔲 Fase 7 — Kualitas dan kesiapan rilis

- [ ] Unit test store, helper, validasi, komponen
- [ ] Playwright: login, rute terlindungi, CRUD
- [ ] Build + type-check + lint bersih
- [ ] Dokumentasi lengkap

## Menambah modul baru

> Dokumentasi ini akan diisi setelah pola modul pertama selesai di Fase 5.

## IDE

[VS Code](https://code.visualstudio.com/) + [Vue (Official / Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar). Nonaktifkan Vetur jika terpasang.
