import { VocabWord } from "@alwa/core";
import { DATA_1SMP } from "./data-1smp";
import { DATA_2SMP } from "./data-2smp";
import { DATA_3SMP } from "./data-3smp";
import { DATA_1SMA } from "./data-1sma";
import { DATA_2SMA } from "./data-2sma";
import { DATA_3SMA } from "./data-3sma";

// Re-export type if needed elsewhere
export type RawWord = Omit<VocabWord, "language" | "createdAt">;

export const RAW_WORDS: RawWord[] = [
  ...DATA_1SMP,
  ...DATA_2SMP,
  ...DATA_3SMP,
  ...DATA_1SMA,
  ...DATA_2SMA,
  ...DATA_3SMA,
];

// Auto-inject 'language' and 'createdAt' so every object conforms to VocabWord.
export const MOCK_WORDS: VocabWord[] = RAW_WORDS.map((w) => ({
  ...w,
  language: "arabic" as const,
  createdAt: "2026-01-01T00:00:00Z",
}));
