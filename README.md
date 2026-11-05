# Praktikum Pemrograman Web Modul 4: MLBB Shop (Diamond & BP)

Backend toko Mobile Legends sederhana berbasis **Express 5 + TypeScript**, **Prisma ORM 7**, dan **PostgreSQL di Neon**.

## Kelompok C13

Repository: `pweb-express-c13-2026`

| Nama | NRP |
|---|---|
| Tafidah Hasna Mumtazah | 5027251025 |
| Yovi Prayudya Rizky Ramadhani | 5027251107 |
| Alif Ramzy Pasha Firdaus | 5027251121 |

## Kontribusi Anggota

### Anggota 1: Alif Ramzy Pasha Firdaus
- Setup project (Express 5 + TypeScript, Prisma 7, koneksi Neon)
- Schema Prisma, migrasi, dan seed dari dataset CSV
- Endpoint `/health`
- Middleware: logger, `HttpError`, `errorHandler`, `notFound`
- Fitur Player: create, detail, update, dan delete (`/api/players`)

### Anggota 2: Tafidah Hasna Mumtazah
- Fitur Hero: daftar (pagination, search, filter role), detail beserta skin, dan tambah hero
- Fitur Skin: daftar (pagination, filter `heroId` dan `rarity`) dan detail
- Fitur Statistik (`/api/statistics`)
- Penulisan README dan pengecekan `.gitignore` agar `.env` tidak ter-commit

### Anggota 3: Yovi Prayudya Rizky Ramadhani
- Fitur Top Up Diamond dan Match (hadiah BP WIN/LOSE)
- Fitur Beli Hero (6 validasi berurutan dan `prisma.$transaction`)
- Pengujian seluruh endpoint di Postman sesuai Urutan Testcase

---

## Tentang Proyek

HMIT ITS menyiapkan versi sederhana dari toko di dalam game Mobile Legends supaya pemain baru (seperti Jamal) paham perbedaan **Diamond** dan **Battle Point (BP)** sebelum turnamen dimulai.

Setiap player punya dua mata uang:

- **Diamond**: didapat dari top up.
- **Battle Point (BP)**: didapat dari bermain match.

Keduanya bisa dipakai untuk membeli hero. Skin hanya ditampilkan (tidak ada fitur beli skin).

## Tech Stack

- Express 5 + TypeScript
- Prisma ORM 7
- PostgreSQL di Neon (`@prisma/adapter-neon`)
- `csv-parse` untuk membaca dataset saat seeding
- `tsx` untuk menjalankan TypeScript langsung

## Struktur Folder

```
.
├── data/
│   ├── heroes.csv            # 133 hero (Miya sampai Hirara)
│   └── skins.csv             # 892 skin
├── prisma/
│   ├── migrations/
│   ├── schema.prisma         # 4 tabel + 4 enum
│   └── seed.ts               # kosongkan tabel, isi hero, skin, player
├── src/
│   ├── lib/
│   │   ├── helpers.ts        # HttpError, sendOk, parseId, pagination
│   │   └── prisma.ts         # Prisma Client + adapter Neon
│   ├── middlewares/
│   │   ├── logger.ts
│   │   ├── notFound.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── hero.ts
│   │   ├── skin.ts
│   │   ├── player.ts         # player, top up, match, beli hero
│   │   └── statistic.ts
│   └── index.ts              # entry point
├── prisma.config.ts
├── package.json
└── tsconfig.json
```

## Cara Menjalankan

### 1. Clone dan install

```bash
git clone https://github.com/USERNAME/pweb-express-c13-2026.git
cd pweb-express-c13-2026
npm install
```

`npm install` otomatis menjalankan `prisma generate` (lewat script `postinstall`).

### 2. Siapkan database di Neon

Buat project di [neon.tech](https://neon.tech), lalu ambil **dua** connection string:

- **Pooled**: host mengandung `-pooler`. Dipakai server saat berjalan.
- **Direct**: host tanpa `-pooler`. Dipakai Prisma Migrate.

### 3. Buat file `.env`

Buat file `.env` di root project (file ini tidak boleh di-commit):

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxx.REGION.aws.neon.tech/neondb?sslmode=require"
PORT=3000
```

### 4. Migrate dan seed

```bash
npx prisma migrate dev --name init
npx prisma generate
npx tsx prisma/seed.ts
```

Cek hasilnya di `npx prisma studio`. Harus ada **133 hero, 892 skin, dan 3 player**.

### 5. Jalankan server

```bash
npm run dev
```

Server berjalan di `http://localhost:3000`. Buka `/health` untuk memastikan server hidup.

## Script

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server (auto-reload) |
| `npm run seed` | Mengosongkan lalu mengisi ulang database |
| `npx prisma studio` | Melihat isi database lewat browser |

## Aturan Diamond dan BP

| Aturan | Nilai |
|---|---|
| Saldo awal player baru | 10.000 BP dan 0 Diamond |
| Top up | Diamond bertambah sebesar `amount` (bilangan bulat > 0) |
| Match | `WIN` +300 BP, `LOSE` +100 BP |
| Beli hero | Bisa pakai BP (`priceBP`) atau Diamond (`priceDiamond`). Jika harganya `null`, hero tidak bisa dibeli dengan mata uang itu |
| Satu hero satu kali | Player tidak boleh membeli hero yang sudah dimilikinya |

## Skema Database

- **Hero**: `id`, `name` (unique), `role`, `lane`, `releaseYear`, `priceBP?`, `priceDiamond?`
- **Skin**: `id`, `name`, `rarity`, `priceDiamond?`, `heroId` (cascade saat hero dihapus)
- **Player**: `id`, `nickname` (unique), `bp` (default 10000), `diamond` (default 0), `createdAt`
- **PlayerHero**: `id`, `playerId` (cascade saat player dihapus), `heroId`, `currency`, `pricePaid`, unique `(playerId, heroId)`

Enum:

- `Role`: TANK, FIGHTER, ASSASSIN, MAGE, MARKSMAN, SUPPORT
- `Lane`: EXP, GOLD, MID, JUNGLE, ROAM
- `Rarity`: COMMON, EXCEPTIONAL, DELUXE, EXQUISITE, GRAND, SUPREME
- `Currency`: BP, DIAMOND

## Format Response

Sukses:

```json
{ "status": true, "message": "Berhasil mengambil data hero", "data": [], "metadata": {} }
```

Gagal:

```json
{ "status": false, "message": "Hero tidak ditemukan" }
```

`metadata` (`currentPage`, `limit`, `totalItems`, `totalPages`) hanya ada di endpoint yang memakai pagination.

## Daftar Endpoint

| Metode | Endpoint | Keterangan |
|---|---|---|
| GET | `/health` | Cek server |
| GET | `/api/heroes` | Daftar hero (`page`, `limit`, `search`, `role`) |
| GET | `/api/heroes/:hero_id` | Detail hero beserta skin |
| POST | `/api/heroes` | Tambah hero baru |
| GET | `/api/skins` | Daftar skin (`page`, `limit`, `heroId`, `rarity`) |
| GET | `/api/skins/:skin_id` | Detail skin beserta hero |
| POST | `/api/players` | Buat player |
| GET | `/api/players/:player_id` | Detail player beserta hero miliknya |
| PATCH | `/api/players/:player_id` | Ganti nickname |
| DELETE | `/api/players/:player_id` | Hapus player beserta hero miliknya |
| POST | `/api/players/:player_id/topup` | Top up Diamond |
| POST | `/api/players/:player_id/matches` | Hadiah BP dari match |
| POST | `/api/players/:player_id/heroes` | Beli hero (BP atau Diamond) |
| GET | `/api/statistics` | Statistik toko |

`page` default 1 dan `limit` default 10.

## Contoh Request

**Top up**

```http
POST /api/players/3/topup
{ "amount": 706 }
```

**Match**

```http
POST /api/players/3/matches
{ "result": "WIN" }
```

**Beli hero**

```http
POST /api/players/3/heroes
{ "heroId": 22, "currency": "DIAMOND" }
```

Response (201):

```json
{
  "status": true,
  "message": "Hero berhasil dibeli",
  "data": {
    "hero": { "id": 22, "name": "Freya" },
    "currency": "DIAMOND",
    "pricePaid": 599,
    "balance": { "bp": 10600, "diamond": 813 }
  }
}
```

## Validasi dan Kode Status

| Endpoint | Kondisi | Status |
|---|---|---|
| `POST /api/heroes` | Field wajib kosong atau enum salah | 400 |
| | Nama hero sudah ada | 409 |
| | Berhasil | 201 |
| `POST /api/players` | `nickname` kosong | 400 |
| | `nickname` sudah dipakai | 409 |
| `PATCH /api/players/:id` | Player tidak ada | 404 |
| | `nickname` kosong | 400 |
| | `nickname` dipakai player lain | 409 |
| `POST /topup` | `amount` bukan bilangan bulat > 0 | 400 |
| | Player tidak ada | 404 |
| `POST /matches` | `result` bukan WIN/LOSE | 400 |
| | Player tidak ada | 404 |
| `POST /heroes` (beli) | Diperiksa berurutan, berhenti di yang pertama gagal: | |
| | 1. `heroId` kosong atau `currency` bukan BP/DIAMOND | 400 |
| | 2. Player tidak ditemukan | 404 |
| | 3. Hero tidak ditemukan | 404 |
| | 4. Harga hero untuk currency itu `null` | 400 |
| | 5. Player sudah memiliki hero itu | 409 |
| | 6. Saldo tidak cukup | 400 |
| | Berhasil | 201 |
| Semua | URL tidak terdaftar | 404 |

Pembelian hero memakai `prisma.$transaction`, jadi pengurangan saldo dan pencatatan `PlayerHero` berhasil atau gagal bersama.

## Data Awal (Seed)

Player:

| id | nickname | bp | diamond |
|---|---|---|---|
| 1 | ArekITS | 1500 | 75 |
| 2 | SangPushRank | 13000 | 2892 |
| 3 | MageSurabaya | 10000 | 0 |

PlayerHero:

| playerId | heroId | currency | pricePaid |
|---|---|---|---|
| 1 | 18 (Layla) | BP | 2000 |
| 1 | 1 (Miya) | BP | 10800 |
| 2 | 84 (Ling) | DIAMOND | 599 |
| 2 | 56 (Gusion) | BP | 32000 |

Jalankan seed ulang sebelum demo supaya data kembali ke kondisi awal.

## Pengujian

Uji endpoint dengan Postman mengikuti Urutan Testcase pada soal. Beberapa angka acuan setelah seed dan testcase dijalankan:

- Detail player 3: `bp 10600`, `diamond 813`, dan Freya ada di daftar hero.
- Statistik: `totalDiamond 3780`.
