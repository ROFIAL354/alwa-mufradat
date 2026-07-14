import { describe, it, expect } from "vitest";
import { getAvailableWords, isSameSchoolGroup } from "../utils/cascade";
import { VocabWord, WordUsageRecord, GradeLevel } from "../types";

// ---------------------------------------------------------------------------
// Helper: build a minimal VocabWord stub for testing
// ---------------------------------------------------------------------------
function makeWord(
  id: string,
  originLevel: GradeLevel,
  language: "arabic" = "arabic",
  type: "fiil" | "ism" = "ism"
): VocabWord {
  return {
    id,
    language,
    word: `كلمة-${id}`,
    latin: `kalimah-${id}`,
    meaning: `Arti kata ${id}`,
    sentences: [],
    originLevel,
    difficulty: Number(originLevel[0]) as 1 | 2 | 3 | 4 | 5 | 6,
    type,
    tags: [],
    createdAt: "2026-01-01T00:00:00Z",
  };
}

function makeUsage(
  wordId: string,
  usedInLevel: GradeLevel,
  language: "arabic" = "arabic"
): WordUsageRecord {
  return {
    id: `ur-${wordId}-${usedInLevel}`,
    wordId,
    language,
    usedInLevel,
    usedAt: "2026-07-07",
    ustadzId: "u-test",
  };
}

// ---------------------------------------------------------------------------
// Seed pool: 2 words per level = 12 total
// ---------------------------------------------------------------------------
const ALL_WORDS: VocabWord[] = [
  makeWord("smp1-a", "1SMP"),
  makeWord("smp1-b", "1SMP"),
  makeWord("smp2-a", "2SMP"),
  makeWord("smp2-b", "2SMP"),
  makeWord("smp3-a", "3SMP"),
  makeWord("smp3-b", "3SMP"),
  makeWord("sma1-a", "1SMA"),
  makeWord("sma1-b", "1SMA"),
  makeWord("sma2-a", "2SMA"),
  makeWord("sma2-b", "2SMA"),
  makeWord("sma3-a", "3SMA"),
  makeWord("sma3-b", "3SMA"),
];

// ===================================================================
// TEST SUITE: isSameSchoolGroup
// ===================================================================
describe("isSameSchoolGroup", () => {
  it("treats all SMP levels as the same group", () => {
    expect(isSameSchoolGroup("1SMP", "2SMP")).toBe(true);
    expect(isSameSchoolGroup("1SMP", "3SMP")).toBe(true);
  });

  it("treats all SMA levels as the same group", () => {
    expect(isSameSchoolGroup("1SMA", "2SMA")).toBe(true);
    expect(isSameSchoolGroup("1SMA", "3SMA")).toBe(true);
  });
});

// ===================================================================
// TEST SUITE: getAvailableWords — Strict Level Isolation
// ===================================================================
describe("getAvailableWords — Strict Level Isolation", () => {
  const noUsage: WordUsageRecord[] = [];

  it("for 1SMP: returns only 1SMP origin words", () => {
    const pool = getAvailableWords(ALL_WORDS, noUsage, "1SMP", "arabic");
    const origins = pool.map((w) => w.originLevel);
    expect(origins).toContain("1SMP");
    expect(origins).not.toContain("2SMP");
    expect(origins).not.toContain("3SMP");
    expect(pool).toHaveLength(2);
  });

  it("for 2SMP: returns only 2SMP words (no 1SMP or 3SMP words)", () => {
    const pool = getAvailableWords(ALL_WORDS, noUsage, "2SMP", "arabic");
    const origins = pool.map((w) => w.originLevel);
    expect(origins).toContain("2SMP");
    expect(origins).not.toContain("1SMP");
    expect(origins).not.toContain("3SMP");
    expect(pool).toHaveLength(2);
  });

  it("for 3SMP: returns only 3SMP words (no 1SMP or 2SMP words)", () => {
    const pool = getAvailableWords(ALL_WORDS, noUsage, "3SMP", "arabic");
    const origins = pool.map((w) => w.originLevel);
    expect(origins).toContain("3SMP");
    expect(origins).not.toContain("1SMP");
    expect(origins).not.toContain("2SMP");
    expect(pool).toHaveLength(2);
  });

  it("for SMA levels: strictly isolates 1SMA, 2SMA, and 3SMA", () => {
    const pool1 = getAvailableWords(ALL_WORDS, noUsage, "1SMA", "arabic");
    expect(pool1.map(w => w.originLevel)).toEqual(["1SMA", "1SMA"]);

    const pool2 = getAvailableWords(ALL_WORDS, noUsage, "2SMA", "arabic");
    expect(pool2.map(w => w.originLevel)).toEqual(["2SMA", "2SMA"]);

    const pool3 = getAvailableWords(ALL_WORDS, noUsage, "3SMA", "arabic");
    expect(pool3.map(w => w.originLevel)).toEqual(["3SMA", "3SMA"]);
  });
});

// ===================================================================
// TEST SUITE: getAvailableWords — Usage Filtering
// ===================================================================
describe("getAvailableWords — Usage Filtering", () => {
  it("excludes words that have already been used in the target level", () => {
    const usage = [makeUsage("smp1-a", "1SMP")];
    const pool = getAvailableWords(ALL_WORDS, usage, "1SMP", "arabic");

    expect(pool.find((w) => w.id === "smp1-a")).toBeUndefined();
    expect(pool.find((w) => w.id === "smp1-b")).toBeDefined();
  });

  it("usage in one level does NOT exclude the word from a different level", () => {
    const usage = [makeUsage("smp1-a", "1SMP")];
    const pool = getAvailableWords(ALL_WORDS, usage, "2SMP", "arabic");
    // Since 2SMP isolates to 2SMP origin, "smp1-a" is not returned anyway, but let's test isolation
    expect(pool.find((w) => w.id === "smp2-a")).toBeDefined();
  });
});
