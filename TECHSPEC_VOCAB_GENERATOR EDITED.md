# Technical Specification & Database Architecture

## ALWA Mufradat — Vocab & Sentence Generator

**Nama Resmi:** ALWA Mufradat (Al Ihsan Wat Taqwa)
**Stack:** React + Vite + TypeScript + Tailwind CSS
**Author:** Solo Developer
**Phase:** Frontend-first (Mock Data) → Phase 2 (AI API + Backend)
**Last Updated:** 2026-07-06 (Rev. 2 — Bug Fix Pass)

---

## 📋 Revision Notes (Rev. 2 — 2026-07-06)

Audit menemukan 4 bug kritis pada logika inti (Section 5, 6, 8). Semua sudah diperbaiki di dokumen ini dan ditandai dengan blok **⚠️ Fix (Rev. 2)** di section terkait:

| #   | Bug                                                                                                                                                | Section Terdampak |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | Arah cascade terbalik — level tertinggi (3SMP/3SMA) justru kehabisan stok tercepat, padahal seharusnya dapat pool terbesar                         | §5                |
| 2   | Refresh manual berulang bisa menghabiskan stok dalam hitungan menit, dan `pickDailyWords` melempar `Error` yang berisiko Hard Crash (White Screen) | §5, §6            |
| 3   | `.toISOString()` berbasis UTC, bukan WIB — tanggal bisa berganti di tengah aktivitas Subuh/pagi                                                    | §6, §8            |
| 4   | `sort(() => Math.random() - 0.5)` adalah shuffle yang bias, bukan distribusi acak merata                                                           | §5                |

---

## Table of Contents

1. [App Overview](#1-app-overview)
2. [User Roles & Authentication](#2-user-roles--authentication)
3. [Jenjang (Grade Level) System](#3-jenjang-grade-level-system)
4. [Vocabulary Data Model (TypeScript Types)](#4-vocabulary-data-model-typescript-types)
5. [Word Cascade & Anti-Repetition Logic](#5-word-cascade--anti-repetition-logic)
6. [Daily Content Engine](#6-daily-content-engine)
7. [Display Specification (Mobile-First)](#7-display-specification-mobile-first)
8. [History & Murajaah Feature](#8-history--murajaah-feature)
9. [React Component Architecture](#9-react-component-architecture)
10. [State Management & Mock Data Strategy](#10-state-management--mock-data-strategy)
11. [localStorage Schema (Phase 1)](#11-localstorage-schema-phase-1)
12. [Phase 2 Roadmap — AI API Integration](#12-phase-2-roadmap--ai-api-integration)

---

## 1. App Overview

### Problem

Santri di Pondok Tahfidz dilarang membawa HP. Ustadz membutuhkan alat bantu digital
untuk memperoleh kosakata harian (Arab + Inggris) yang relevan per jenjang kelas,
lalu menuliskannya secara manual di papan tulis. Tanpa alat ini, pilihan kosakata
dilakukan secara ad-hoc dan tidak terstruktur.

### Solution

Aplikasi web mobile-first yang:

- Diakses **hanya oleh Ustadz** melalui HP masing-masing
- **Otomatis** menyajikan 3 kosakata Bahasa Arab per hari sesuai jenjang
- Mengelola **tabungan database** kosakata Arab agar materi tidak stagnan
- Menyimpan **riwayat** untuk keperluan Murajaah (review hafalan)

### Core Constraint

> Tidak ada input manual dari Ustadz untuk memilih kata.
> Aplikasi yang memilihkan kata secara otomatis.

---

## 2. User Roles & Authentication

### Roles

| Role     | Akses           | Keterangan                            |
| -------- | --------------- | ------------------------------------- |
| `ustadz` | Full app access | Satu-satunya peran yang ada di sistem |

> Tidak ada role admin atau santri di Phase 1.

### Auth Strategy (Phase 1 — Mock)

- Username + Password sederhana (no email, no OTP)
- Setiap Ustadz punya assignedLevels[] — level mana saja yang boleh ia akses
- Session disimpan di localStorage sebagai simple token (mock)
- Auto-logout: Tidak ada (sesi persisten di HP masing-masing)

### TypeScript Types

```typescript
type GradeLevel = "1SMP" | "2SMP" | "3SMP" | "1SMA" | "2SMA" | "3SMA";

interface Ustadz {
  id: string;
  name: string;
  username: string;
  passwordHash: string; // plain text untuk mock Phase 1
  assignedLevels: GradeLevel[];
  createdAt: string; // ISO 8601
}

interface AuthSession {
  ustadzId: string;
  username: string;
  assignedLevels: GradeLevel[];
  loginAt: string;
}
```

### Mock Data — Ustadz Accounts

```typescript
// src/data/mock/users.ts
export const MOCK_USTADZ: Ustadz[] = [
  {
    id: "u-001",
    name: "Ustadz Ahmad Fauzi",
    username: "ahmad",
    passwordHash: "smp123",
    assignedLevels: ["1SMP", "2SMP", "3SMP"],
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "u-002",
    name: "Ustadz Hasan Basri",
    username: "hasan",
    passwordHash: "sma123",
    assignedLevels: ["1SMA", "2SMA", "3SMA"],
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "u-003",
    name: "Ustadz Ridwan",
    username: "ridwan",
    passwordHash: "all123",
    assignedLevels: ["1SMP", "2SMP", "3SMP", "1SMA", "2SMA", "3SMA"],
    createdAt: "2026-01-01T00:00:00Z",
  },
];
```

---

## 3. Jenjang (Grade Level) System

### Level Map

| Level ID | Label       | Tingkat Kesulitan | Target Kosakata                           |
| -------- | ----------- | ----------------- | ----------------------------------------- |
| `1SMP`   | Kelas 1 SMP | 1/6               | Kata dasar, konkret, kosakata sehari-hari |
| `2SMP`   | Kelas 2 SMP | 2/6               | Sedikit abstrak, mulai kalimat majemuk    |
| `3SMP`   | Kelas 3 SMP | 3/6               | Kosakata akademik dasar                   |
| `1SMA`   | Kelas 1 SMA | 4/6               | Kosakata akademik menengah                |
| `2SMA`   | Kelas 2 SMA | 5/6               | Kosakata formal, teks bacaan kompleks     |
| `3SMA`   | Kelas 3 SMA | 6/6               | Advanced, kosakata sastra/ilmiah          |

```typescript
// src/types/index.ts

const LEVEL_DIFFICULTY: Record<GradeLevel, number> = {
  "1SMP": 1,
  "2SMP": 2,
  "3SMP": 3,
  "1SMA": 4,
  "2SMA": 5,
  "3SMA": 6,
};

const LEVEL_LABELS: Record<GradeLevel, string> = {
  "1SMP": "Kelas 1 SMP",
  "2SMP": "Kelas 2 SMP",
  "3SMP": "Kelas 3 SMP",
  "1SMA": "Kelas 1 SMA",
  "2SMA": "Kelas 2 SMA",
  "3SMA": "Kelas 3 SMA",
};
```

---

## 4. Vocabulary Data Model (TypeScript Types)

```typescript
// src/types/index.ts

type Language = "arabic";

interface ExampleSentence {
  id: string;
  sentence: string; // Teks Arab
  latin: string; // Transliterasi Latin (WAJIB untuk Arab)
  meaning: string; // Terjemahan Indonesia
}

interface VocabWord {
  id: string; // e.g. "w-ar-001"
  language: Language;
  word: string; // e.g. "كِتَابٌ"
  latin: string; // Transliterasi (WAJIB untuk Arab)
  meaning: string; // Arti Indonesia
  sentences: ExampleSentence[]; // Tepat 1 kalimat contoh terbaik
  originLevel: GradeLevel; // Level "pemilik" kata ini
  difficulty: 1 | 2 | 3 | 4 | 5 | 6; // Mirror dari LEVEL_DIFFICULTY[originLevel]
  tags?: string[]; // e.g. ["benda", "ibadah", "alam"]
  createdAt: string;
}

interface WordUsageRecord {
  id: string;
  wordId: string;
  language: Language;
  usedInLevel: GradeLevel; // Level mana yang menggunakan kata ini
  usedAt: string; // ISO 8601 date string
  ustadzId: string;
}
```

### Contoh Data Arabic

```typescript
const exampleArabicWord: VocabWord = {
  id: "w-ar-001",
  language: "arabic",
  word: "كِتَابٌ",
  latin: "Kitaab",
  meaning: "Buku",
  sentences: [
    {
      id: "s-ar-001-1",
      sentence: "هَذَا كِتَابٌ جَمِيلٌ",
      latin: "Haadzaa kitaabun jamiil",
      meaning: "Ini adalah buku yang indah",
    },
  ],
  originLevel: "1SMP",
  difficulty: 1,
  tags: ["benda", "sekolah"],
  createdAt: "2026-01-01T00:00:00Z",
};
```

---

## 5. Word Cascade & Anti-Repetition Logic

### Aturan Inti

> **⚠️ Fix (Rev. 2):** Arah cascade dibalik dari versi sebelumnya. Versi lama
> menurunkan kata dari level tinggi ke level rendah — secara matematis ini
> membuat level tertinggi (3SMP/3SMA) hanya kebagian pool miliknya sendiri
> (30 kata → habis ~10 hari), sementara level 1 punya pool 3× lebih besar.
> Ini juga berisiko pedagogis: santri kelas 1 bisa menerima kata tingkat
> lanjut yang belum saatnya mereka pelajari.
>
> Arah yang benar: kata level rendah **naik** ke level tinggi sebagai
> **murajaah (review)** — sejalan dengan kebiasaan pesantren bahwa kelas
> senior perlu mengulang materi dasar, bukan sebaliknya.

Kata yang sudah ditampilkan di level X **TIDAK BOLEH** muncul lagi di level X.
Kata dari level X **BOLEH** dinaikkan (di-review) ke level-level di atas X dalam grup yang sama.

### Cascade Rules

```
SMP GROUP:
  1SMP word → tersedia untuk: 1SMP (TERKUNCI - sudah used), 2SMP (OK - murajaah), 3SMP (OK - murajaah)
  2SMP word → tersedia untuk: 1SMP (tidak relevan - terlalu sulit), 2SMP (TERKUNCI), 3SMP (OK - murajaah)
  3SMP word → tersedia untuk: 1SMP (tidak relevan), 2SMP (tidak relevan), 3SMP (TERKUNCI)

SMA GROUP:
  1SMA word → tersedia untuk: 1SMA (TERKUNCI - sudah used), 2SMA (OK - murajaah), 3SMA (OK - murajaah)
  2SMA word → tersedia untuk: 1SMA (tidak relevan - terlalu sulit), 2SMA (TERKUNCI), 3SMA (OK - murajaah)
  3SMA word → tersedia untuk: 1SMA (tidak relevan), 2SMA (tidak relevan), 3SMA (TERKUNCI)

CROSS-GROUP:
  [RESOLVED] Kata SMA TIDAK BOLEH cascade ke SMP.
  Cascade terisolasi ketat dalam kelompoknya masing-masing (SMP-only, SMA-only).
  Alasan: Gap kesulitan terlalu jauh, berpotensi membingungkan santri SMP.

DAMPAK UKURAN POOL (setelah fix):
  1SMP: pool 30 kata (hanya miliknya sendiri)      → ~10 hari
  2SMP: pool 60 kata (1SMP + 2SMP)                 → ~20 hari
  3SMP: pool 90 kata (1SMP + 2SMP + 3SMP)          → ~30 hari
  (pola yang sama berlaku untuk grup SMA)

  Kelas 1 kini menjadi titik tercepat kehabisan stok — ini WAJAR karena
  kurikulum kelas 1 memang paling dasar/terbatas, dan santri akan naik
  kelas jauh sebelum stok benar-benar jadi masalah.
```

### Algorithm: getAvailableWords()

> **⚠️ Fix (Rev. 2):** Operator perbandingan di baris terakhir diubah dari
> `>=` menjadi `<=` — lihat penjelasan arah cascade di atas.

```typescript
// src/utils/wordSelector.ts

function getAvailableWords(
  allWords: VocabWord[],
  usageRecords: WordUsageRecord[],
  targetLevel: GradeLevel,
  language: Language,
): VocabWord[] {
  // Set kata yang sudah dipakai di targetLevel ini
  const usedWordIds = new Set(
    usageRecords
      .filter((r) => r.usedInLevel === targetLevel && r.language === language)
      .map((r) => r.wordId),
  );

  return allWords.filter((word) => {
    if (word.language !== language) return false;
    if (usedWordIds.has(word.id)) return false; // Sudah used di level ini

    const wordDifficulty = LEVEL_DIFFICULTY[word.originLevel];
    const targetDifficulty = LEVEL_DIFFICULTY[targetLevel];
    const sameGroup = isSameSchoolGroup(word.originLevel, targetLevel);

    // FIX: kata tersedia jika grup sama DAN kesulitan kata <= target
    // (cascade dari BAWAH ke ATAS — level tinggi me-review kata level rendah)
    return sameGroup && wordDifficulty <= targetDifficulty;
  });
}

function isSameSchoolGroup(a: GradeLevel, b: GradeLevel): boolean {
  const smp: GradeLevel[] = ["1SMP", "2SMP", "3SMP"];
  const sma: GradeLevel[] = ["1SMA", "2SMA", "3SMA"];
  return (
    (smp.includes(a) && smp.includes(b)) || (sma.includes(a) && sma.includes(b))
  );
}
```

### Algorithm: pickDailyWords()

> **⚠️ Fix (Rev. 2):** Dua masalah diperbaiki sekaligus:
>
> 1. `sort(() => Math.random() - 0.5)` adalah teknik shuffle yang **bias**
>    (hasilnya bergantung pada implementasi sort engine, bukan probabilitas
>    yang benar-benar merata). Diganti dengan **Fisher-Yates shuffle**,
>    algoritma standar yang terbukti unbiased.
> 2. Fungsi ini tidak lagi melempar `Error` saat stok kurang dari `count`.
>    `Error` yang dilempar di tengah siklus render React (mis. dipanggil
>    dari dalam hook `useDailyContent`) berisiko **Hard Crash
>    (White Screen of Death)** jika tidak dibungkus Error Boundary.
>    Sebagai gantinya, fungsi ini mengembalikan pool apa adanya — logika
>    pencegahan stok kritis dipindah ke pemanggilnya,
>    `forceRefreshDailyContent()` (lihat Section 6).

```typescript
// src/utils/wordSelector.ts

function pickDailyWords(pool: VocabWord[], count: number = 3): VocabWord[] {
  if (pool.length < count) {
    // Jangan crash — kembalikan seadanya. Pemanggil (forceRefreshDailyContent /
    // generateAndSave) yang bertanggung jawab memicu partial-reset jika ini terjadi.
    return pool;
  }

  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, count);
}
```

### Stock Depletion Handling

> **⚠️ Fix (Rev. 2):** Baris "stok kritis" diubah — tidak lagi masuk ke
> `Error state` yang berisiko crash. Sistem melakukan **partial auto-reset**
> (hapus `WordUsageRecord` khusus level yang kritis; level lain tidak
> tersentuh), lalu generate ulang otomatis. Implementasinya ada di
> `forceRefreshDailyContent()`, Section 6.

| Jumlah Stok Tersedia (pool) | Aksi Sistem                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| > 10 kata                   | Normal, tidak ada warning                                                                              |
| 5–10 kata                   | Badge warning kuning di UI                                                                             |
| 4 kata                      | Alert merah, siapkan Phase 2 AI                                                                        |
| < 3 kata (kritis)           | **Partial auto-reset**: hapus usage record level ini saja, generate ulang otomatis — bukan Error/crash |

---

## 6. Daily Content Engine

### TypeScript Types

```typescript
interface DailyContent {
  id: string;
  date: string; // "YYYY-MM-DD" — key unik per hari per level
  level: GradeLevel;
  ustadzId: string;
  arabicWords: VocabWord[]; // Selalu tepat 3
  generatedAt: string; // ISO 8601
  generatedBy: "auto" | "manual";
}
```

### Generation Flow

```
TRIGGER: App dibuka (auto) ATAU tombol "Muat Materi Hari Ini" (manual)
    ↓
1. Ambil tanggal hari ini (LOCAL/WIB — lihat fix zona waktu di bawah): YYYY-MM-DD
2. Cek localStorage key: daily_{level}_{date}
   → ADA: Langsung tampilkan (tidak re-generate)
   → TIDAK ADA: Lanjut ke step 3
    ↓
3. Load semua VocabWord dari sumber (mock data)
4. Load WordUsageRecord[] dari localStorage
5. getAvailableWords() → dapatkan pool Arab
6. pickDailyWords(arabicPool, 3)
7. Simpan DailyContent ke localStorage
8. Append kata baru yang benar-benar terpakai ke WordUsageRecord[]
9. Render ke UI
```

> Catatan: sejak fix di atas, jika pool pada step 5 kurang dari 3, step 6
> **tidak lagi crash** — lihat `pickDailyWords()`. Untuk trigger manual, ada
> pengecekan tambahan sebelum step 3 yang menjaga pool tidak sampai kritis
> di awal. Lihat "Manual Refresh" di bawah.

### Midnight Auto-Reset (Tidak butuh cron job)

> **⚠️ Fix (Rev. 2) — Bug Zona Waktu:** Versi sebelumnya memakai
> `new Date().toISOString().split('T')[0]`, yang selalu berbasis **UTC**
> (GMT+0). Karena aktivitas pondok dimulai pagi hari sekitar pukul
> 04:30–06:00 **WIB** (GMT+7), rentang jam 00:00–06:59 WIB masih terhitung
> "kemarin" menurut UTC. Akibatnya tanggal bisa berganti sendiri di
> tengah-tengah aktivitas pagi — kata yang baru ditulis Ustadz jam 5 pagi
> bisa berubah jika HP dibuka lagi jam 8 pagi. Diperbaiki dengan fungsi
> tanggal yang sadar zona waktu lokal perangkat:

```typescript
// src/utils/dateUtils.ts

/**
 * Mengonversi Date menjadi string "YYYY-MM-DD" berdasarkan zona waktu
 * LOKAL perangkat (WIB), bukan UTC. Dipakai di semua tempat yang butuh
 * "tanggal hari ini menurut jam pesantren" — loadDailyContent,
 * forceRefreshDailyContent, dan getHistoryForLevel (Section 8).
 */
export function getLocalDateString(date: Date = new Date()): string {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
}

export function getLocalTodayString(): string {
  return getLocalDateString(new Date());
}
```

```typescript
// src/hooks/useDailyContent.ts

// Auto-reset bekerja karena localStorage key menyertakan tanggal.
// Ketika hari berganti (menurut jam lokal WIB), key lama tidak ditemukan
// → auto generate baru.
function loadDailyContent(level: GradeLevel, ustadzId: string): DailyContent {
  const today = getLocalTodayString(); // FIX: local (WIB), bukan UTC
  const key = STORAGE_KEYS.daily(level, today);
  const cached = storage.get<DailyContent>(key);
  if (cached) return cached;
  return generateAndSave(level, ustadzId, today, "auto");
}
```

_(Pemanggilan disesuaikan memakai `STORAGE_KEYS.daily()` dan `storage.get()` dari Section 11 — bukan bagian dari bug asli, hanya polish konsistensi karena helper-nya sudah ada.)_

### Manual Refresh — "Muat Materi Hari Ini"

> **⚠️ Fix (Rev. 2) — Anti Burn-out:** Versi sebelumnya berisiko dieksploitasi:
> jika Ustadz menekan tombol refresh 8–10 kali berturut-turut (misal karena
> kurang sreg dengan kata yang muncul), setiap klik "membakar" hingga 6 kata
> baru ke `WordUsageRecord` tanpa pernah dihapus. Dalam hitungan menit, stok
> level tersebut bisa habis total di hari yang sama, lalu memicu
> `STOK_HABIS` yang lama.
>
> Perbaikan: sebelum generate ulang, sistem mengecek dulu apakah pool
> tersisa masih cukup (≥3 kata Arab). Jika sudah
> kritis, sistem melakukan **partial auto-reset** — hanya menghapus
> `WordUsageRecord` milik **level ini saja** (level lain sama sekali tidak
> tersentuh) — alih-alih mengunci aplikasi dengan status Error.

```typescript
// src/utils/dailyEngine.ts

function forceRefreshDailyContent(
  level: GradeLevel,
  ustadzId: string,
): DailyContent {
  const today = getLocalTodayString(); // FIX: local (WIB), bukan UTC
  const key = STORAGE_KEYS.daily(level, today);
  storage.remove(key); // Hapus cache hari ini

  // FIX: cek pool SEBELUM generate. Jika kritis, partial-reset dulu supaya
  // pickDailyWords() tidak pernah menerima pool yang sudah mepet.
  const allWords = loadAllMockWords();
  let usageRecords = storage.get<WordUsageRecord[]>(STORAGE_KEYS.USAGE) ?? [];

  const arabicPool = getAvailableWords(allWords, usageRecords, level, "arabic");

  if (arabicPool.length < 3) {
    // Partial reset — HANYA level ini, level lain tidak terpengaruh
    usageRecords = usageRecords.filter((r) => r.usedInLevel !== level);
    storage.set(STORAGE_KEYS.USAGE, usageRecords);
  }

  return generateAndSave(level, ustadzId, today, "manual");
  // Catatan: di luar kondisi kritis di atas, WordUsageRecord kata lama
  // tetap TIDAK dihapus — perilaku normal refresh tidak berubah.
}
```

---

## 7. Display Specification (Mobile-First)

### Target Device

- Ukuran layar: HP Android/iOS, lebar 360px–430px
- Orientasi: Portrait only
- Tidak ada TV/Proyektor — Ustadz melihat HP lalu tulis manual di papan

### Layout Wireframe

```
┌───────────────────────────┐
│  HEADER                   │
│  [Logo Pondok + Nama Pondok] │
│  Pondok Tahfidz Al Ihsan Wat Taqwa Kebumen  [Logout] │
├───────────────────────────┤
│  LEVEL SELECTOR           │
│  [1SMP] [2SMP] [3SMP]     │  ← hanya level yang di-assign
├───────────────────────────┤
│  DATE BAR                 │
│  Kamis, 3 Juli 2026       │
│  [Muat Materi Hari Ini ↺] │
├───────────────────────────┤
│  SECTION: BAHASA ARAB     │
│  ─────────────────────    │
│  [VocabCard]              │
│    كِتَابٌ    (RTL)       │
│    Kitaab                 │
│    Buku                   │
│    Contoh Kalimat Terbaik:│
│    هَذَا كِتَابٌ جَمِيلٌ   │
│    Haadzaa kitaabun jamiil │
│    "Ini adalah buku yang indah"│
│  [VocabCard] × 2 lagi     │
├───────────────────────────┤
│  [Lihat Riwayat Kemarin]  │
└───────────────────────────┘
```

### VocabCard — Field Display Rules

| Field                  | Arabic                      |
| ---------------------- | --------------------------- |
| Kata utama             | Teks Arab (RTL, font besar) |
| Transliterasi Latin    | WAJIB                       |
| Arti Indonesia         | WAJIB                       |
| Kalimat contoh         | 1 kalimat terbaik           |
| Latin per kalimat      | WAJIB                       |
| Terjemahan per kalimat | WAJIB                       |

### ArabicText Component Rules

```typescript
// src/components/common/ArabicText.tsx
// WAJIB dipakai untuk semua teks Arab
// CSS yang harus ada:
//   direction: rtl
//   text-align: right
//   font-family: 'Amiri', 'Scheherazade New', serif  (dari Google Fonts)
//   font-size: minimal 28px agar mudah dibaca Ustadz
```

---

## 8. History & Murajaah Feature

### Fungsi

Ustadz dapat melihat kosakata hari-hari sebelumnya untuk sesi **Murajaah**
(review hafalan santri) sebelum masuk materi baru hari ini.

### TypeScript Types

> **⚠️ Fix (Rev. 2):** Sama seperti Section 6, `d.toISOString().split('T')[0]`
> di sini juga kena bug zona waktu UTC. Diganti dengan `getLocalDateString(d)`
> yang didefinisikan di Section 6, supaya daftar riwayat konsisten dengan
> tanggal yang dipakai saat generate konten harian — tanpa ini, entri
> riwayat bisa "meleset" satu hari dari yang sebenarnya dilihat Ustadz.

```typescript
// History tidak butuh tabel terpisah.
// Cukup query dari DailyContent yang tersimpan di localStorage.

function getHistoryForLevel(
  level: GradeLevel,
  daysBack: number = 30,
): DailyContent[] {
  const results: DailyContent[] = [];
  const today = new Date();

  for (let i = 1; i <= daysBack; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d); // FIX: local (WIB), bukan UTC
    const key = STORAGE_KEYS.daily(level, dateStr);
    const cached = storage.get<DailyContent>(key);
    if (cached) results.push(cached);
  }

  return results.sort((a, b) => b.date.localeCompare(a.date)); // Terbaru di atas
}
```

### UI: Halaman Murajaah

```
┌───────────────────────────┐
│  [←] Kembali              │
│  Riwayat Materi           │
│  Kelas 1 SMP              │
├───────────────────────────┤
│  Rabu, 2 Juli 2026        │
│  [Lihat Detail ▾]         │
│  (expand: tampilkan 6     │
│   VocabCard seperti       │
│   tampilan hari ini)      │
├───────────────────────────┤
│  Selasa, 1 Juli 2026      │
│  [Lihat Detail ▾]         │
├───────────────────────────┤
│  ... hingga 30 hari lalu  │
└───────────────────────────┘
```

---

## 9. React Component Architecture

### File & Folder Structure

```
src/
├── types/
│   └── index.ts                    ← Semua TypeScript types & constants
│
├── data/
│   └── mock/
│       ├── users.ts                ← MOCK_USTADZ[]
│       ├── arabic/
│       │   ├── level_1SMP.ts       ← VocabWord[] Arab untuk 1 SMP (30 kata)
│       │   ├── level_2SMP.ts
│       │   ├── level_3SMP.ts
│       │   ├── level_1SMA.ts
│       │   ├── level_2SMA.ts
│       │   └── level_3SMA.ts
│       └── (tidak ada english folder di design akhir — hanya arabic)
│
├── utils/
│   ├── wordSelector.ts             ← getAvailableWords(), pickDailyWords()
│   ├── dailyEngine.ts              ← loadDailyContent(), forceRefreshDailyContent()
│   ├── historyUtils.ts             ← getHistoryForLevel()
│   ├── storageUtils.ts             ← localStorage get/set/clear wrappers
│   └── dateUtils.ts                ← formatDate(), getLocalDateString(), getLocalTodayString()
│
├── hooks/
│   ├── useAuth.ts                  ← login(), logout(), session state
│   ├── useDailyContent.ts          ← load, refresh, loading/error state
│   └── useHistory.ts               ← history list + expand state
│
├── context/
│   └── AppContext.tsx              ← Global state: auth + currentLevel + content
│
├── components/
│   ├── auth/
│   │   └── LoginPage.tsx           ← Form username + password
│   ├── layout/
│   │   ├── AppLayout.tsx           ← Shell wrapper
│   │   └── Header.tsx              ← Logo + nama Ustadz + Logout
│   ├── dashboard/
│   │   ├── DashboardPage.tsx       ← Halaman utama
│   │   ├── LevelSelector.tsx       ← Tab jenjang (hanya assigned levels)
│   │   ├── DateBar.tsx             ← Tanggal + tombol Muat Materi
│   │   ├── VocabSection.tsx        ← Container Arab / Inggris
│   │   └── VocabCard.tsx           ← Card per kata (word+latin+meaning+sentences)
│   ├── common/
│   │   ├── ArabicText.tsx          ← RTL Arabic text renderer
│   │   ├── StockWarningBadge.tsx   ← Badge warning stok menipis
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx       ← Rekomendasi baru (Rev. 2, opsional):
│   │                                  defense-in-depth untuk error tak
│   │                                  terduga lain di render cycle —
│   │                                  bukan pengganti fix di §5/§6
│   └── history/
│       ├── HistoryPage.tsx         ← Halaman riwayat Murajaah
│       ├── HistoryList.tsx         ← Accordion list tanggal
│       └── HistoryDetailCard.tsx   ← Detail konten per hari
│
└── App.tsx                         ← Route: /login | /dashboard | /history
```

### Component Data Flow Diagram

```
AppContext (Provider)
  ├── state.auth        → useAuth hook → LoginPage
  ├── state.currentLevel → LevelSelector (dispatch setLevel)
  └── state.dailyContent → useDailyContent hook
                              ├── DashboardPage
                              │     ├── DateBar (tombol refresh)
                              │     ├── VocabSection (Arabic)
                              │     │     └── VocabCard × 3
                              └── HistoryPage
                                    └── HistoryList
                                          └── HistoryDetailCard
```

---

## 10. State Management & Mock Data Strategy

### Pilihan: React Context + useReducer

Tidak perlu Redux/Zustand di Phase 1. Context cukup untuk skala ini.

```typescript
// src/context/AppContext.tsx

interface AppState {
  auth: {
    isLoggedIn: boolean;
    currentUser: Ustadz | null;
    session: AuthSession | null;
  };
  ui: {
    currentLevel: GradeLevel | null;
    isLoading: boolean;
    error: string | null;
  };
  content: {
    dailyContent: DailyContent | null;
    stockCount: {
      arabic: number;
    };
  };
}

type AppAction =
  | { type: "LOGIN"; payload: { user: Ustadz; session: AuthSession } }
  | { type: "LOGOUT" }
  | { type: "SET_LEVEL"; payload: GradeLevel }
  | { type: "SET_DAILY_CONTENT"; payload: DailyContent }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_STOCK"; payload: { arabic: number } };
```

### Mock Data Volume Target

| Level     | Arab (kata) | Total   |
| --------- | ----------- | ------- |
| 1SMP      | 30          | 30      |
| 2SMP      | 30          | 30      |
| 3SMP      | 30          | 30      |
| 1SMA      | 30          | 30      |
| 2SMA      | 30          | 30      |
| 3SMA      | 30          | 30      |
| **Total** | **180**     | **180** |

> 30 kata per bahasa per level = ~10 hari konten unik sebelum stok habis.
> Cukup untuk simulasi awal di pondok. Phase 2 AI mengisi ulang otomatis.

---

## 11. localStorage Schema (Phase 1)

```
KEY                             VALUE TYPE          KETERANGAN
────────────────────────────    ────────────────    ────────────────────────────
auth_session                    AuthSession (JSON)  Session Ustadz aktif
usage_records                   WordUsageRecord[]   Semua kata yang pernah tampil
daily_{level}_{YYYY-MM-DD}     DailyContent (JSON) Konten per level per tanggal

Contoh keys yang akan ada di localStorage:
  auth_session
  usage_records
  daily_1SMP_2026-07-03
  daily_1SMP_2026-07-02
  daily_1SMP_2026-07-01
  daily_3SMA_2026-07-03
```

### Storage Utility

```typescript
// src/utils/storageUtils.ts

export const STORAGE_KEYS = {
  AUTH: "auth_session",
  USAGE: "usage_records",
  daily: (level: GradeLevel, date: string) => `daily_${level}_${date}`,
} as const;

export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key: string): void => localStorage.removeItem(key),
};
```

---

## 12. Phase 2 Roadmap — AI API Integration

### Trigger Kondisi Phase 2 Aktif

1. Stok kata < 5 untuk bahasa tertentu di level tertentu
2. Admin/Ustadz klik tombol "Generate Kata Baru via AI"
3. (Opsional) Jadwal mingguan otomatis via backend cron job

### AI Prompt Strategy

```typescript
// src/services/aiWordGenerator.ts (Phase 2)

function buildPrompt(
  language: Language,
  level: GradeLevel,
  existingWords: string[],
): string {
  const langLabel = "Bahasa Arab";

  return `
Kamu adalah generator kosakata ${langLabel} untuk santri pondok tahfidz ${LEVEL_LABELS[level]}.
Tingkat kesulitan target: ${LEVEL_DIFFICULTY[level]}/6.

Buatkan 10 kosakata BARU yang:
- Relevan dengan tingkat ${LEVEL_LABELS[level]}
- Belum ada dalam daftar ini: ${existingWords.join(", ")}
- Dilengkapi: transliterasi latin, arti Indonesia, 1 kalimat contoh terbaik

Format output: JSON array sesuai interface VocabWord.
  `.trim();
}
```

### Backend Architecture (Phase 2 Preview)

```
Frontend React (Vite)
    ↓ HTTP/REST
API Gateway
    ↓
Backend (Node.js + Express)
    ├── /auth         → JWT Authentication
    ├── /words        → CRUD Vocabulary
    ├── /daily        → Daily Content Engine
    ├── /history      → Usage History
    └── /ai/generate  → Trigger AI Word Generation
    ↓
PostgreSQL Database  +  OpenAI / Gemini API
```

### PostgreSQL Schema (Phase 2)

```sql
-- Ustadz accounts
CREATE TABLE ustadz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  assigned_levels TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vocabulary words
CREATE TABLE vocab_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language VARCHAR(10) NOT NULL CHECK (language = 'arabic'),
  word TEXT NOT NULL,
  latin TEXT,
  meaning TEXT NOT NULL,
  origin_level VARCHAR(10) NOT NULL,
  difficulty SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 6),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example sentences (relasi 1-to-many)
CREATE TABLE example_sentences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id UUID REFERENCES vocab_words(id) ON DELETE CASCADE,
  sentence TEXT NOT NULL,
  latin TEXT,
  meaning TEXT NOT NULL
);

-- Usage tracking (anti-repetisi)
-- UNIQUE constraint: satu kata hanya bisa "used" sekali per level
CREATE TABLE word_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id UUID REFERENCES vocab_words(id),
  used_in_level VARCHAR(10) NOT NULL,
  used_at DATE NOT NULL,
  ustadz_id UUID REFERENCES ustadz(id),
  UNIQUE(word_id, used_in_level)
);

-- Daily content snapshot
CREATE TABLE daily_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  level VARCHAR(10) NOT NULL,
  ustadz_id UUID REFERENCES ustadz(id),
  arabic_word_ids UUID[] NOT NULL,   -- Array of 3 word IDs
  -- english_word_ids tidak lagi digunakan di desain akhir
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by VARCHAR(10) DEFAULT 'auto',
  UNIQUE(date, level, ustadz_id)
);
```

---

## Appendix: Open Questions & Decisions Log

| #   | Pertanyaan                                                      | Status      | Keputusan                                                                                             |
| --- | --------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| 1   | Apakah kata SMA bisa cascade ke SMP?                            | ✅ RESOLVED | TIDAK — cascade terisolasi ketat per grup                                                             |
| 2   | Nama resmi aplikasi?                                            | ✅ RESOLVED | **ALWA Mufradat** (Al Ihsan Wat Taqwa)                                                                |
| 3   | Volume mock data per level?                                     | ✅ RESOLVED | 30 kata/bahasa/level (360 total)                                                                      |
| 4   | Force refresh hapus usage record?                               | ✅ RESOLVED | TIDAK secara default, record tetap (lihat #6 untuk pengecualian saat stok kritis)                     |
| 5   | Arah cascade: level tinggi → rendah, atau rendah → tinggi?      | ✅ RESOLVED | **Dibalik (Rev. 2)** jadi rendah → tinggi (murajaah). Kelas 1 kini jadi pool terkecil, ini disengaja  |
| 6   | Bagaimana menangani stok habis akibat spam klik refresh manual? | ✅ RESOLVED | **Partial auto-reset (Rev. 2)**: hapus usage record khusus level tsb saat pool < 3, bukan Error/crash |
| 7   | Zona waktu untuk deteksi pergantian hari?                       | ✅ RESOLVED | **Local timezone device/WIB (Rev. 2)** via `getLocalDateString()`, bukan `.toISOString()` UTC murni   |
| 8   | Metode shuffle kata harian?                                     | ✅ RESOLVED | **Fisher-Yates shuffle (Rev. 2)** — `sort(Math.random()-0.5)` versi lama terbukti bias                |
| 9   | AI provider Phase 2?                                            | ❓ OPEN     | OpenAI / Gemini (TBD)                                                                                 |
| 10  | Backend framework Phase 2?                                      | ❓ OPEN     | Node.js + Express (rekomendasi)                                                                       |
| 11  | Apakah perlu panel admin untuk tambah kata manual?              | ❓ OPEN     | Phase 2 scope                                                                                         |

---

_Dokumen ini adalah panduan mutlak sebelum mendesain layout di Google Stitch._
_Update dokumen setiap ada keputusan arsitektur baru._
