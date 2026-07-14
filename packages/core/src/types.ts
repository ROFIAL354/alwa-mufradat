export type GradeLevel = "1SMP" | "2SMP" | "3SMP" | "1SMA" | "2SMA" | "3SMA";

export const LEVEL_DIFFICULTY: Record<GradeLevel, number> = {
  "1SMP": 1,
  "2SMP": 2,
  "3SMP": 3,
  "1SMA": 4,
  "2SMA": 5,
  "3SMA": 6,
};

export const LEVEL_LABELS: Record<GradeLevel, string> = {
  "1SMP": "Kelas 1 SMP",
  "2SMP": "Kelas 2 SMP",
  "3SMP": "Kelas 3 SMP",
  "1SMA": "Kelas 1 SMA",
  "2SMA": "Kelas 2 SMA",
  "3SMA": "Kelas 3 SMA",
};

export interface Ustadz {
  id: string;
  name: string;
  username: string;
  passwordHash: string; // Plain text in Phase 1
  assignedLevels: GradeLevel[];
  createdAt: string; // ISO 8601
}

export interface AuthSession {
  ustadzId: string;
  username: string;
  assignedLevels: GradeLevel[];
  loginAt: string;
}

export type Language = "arabic";

export interface ExampleSentence {
  id: string;
  sentence: string; // Arabic text
  latin: string; // Transliteration
  meaning: string; // Indonesian meaning
}

export interface VocabWord {
  id: string;
  language: Language;
  word: string; // Arabic text
  latin: string; // Transliteration
  meaning: string; // Indonesian meaning
  sentences: ExampleSentence[]; // 1 example sentence
  originLevel: GradeLevel;
  difficulty: 1 | 2 | 3 | 4 | 5 | 6;
  type: "fiil" | "ism";
  tags?: string[];
  createdAt: string;
}

export interface WordUsageRecord {
  id: string;
  wordId: string;
  language: Language;
  usedInLevel: GradeLevel;
  usedAt: string; // ISO 8601 YYYY-MM-DD date string
  ustadzId: string;
}

export interface DailyContent {
  id: string;
  date: string; // "YYYY-MM-DD"
  level: GradeLevel;
  ustadzId: string;
  arabicWords: VocabWord[]; // Exactly 3
  generatedAt: string; // ISO 8601
  generatedBy: "auto" | "manual";
}
