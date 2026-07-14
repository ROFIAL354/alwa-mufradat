import { describe, it, expect } from "vitest";
import { pickDailyWords, generateDailyContent } from "../utils/daily";
import { getAvailableWords } from "../utils/cascade";
import { VocabWord, WordUsageRecord, GradeLevel } from "../types";

// ---------------------------------------------------------------------------
// Helper: build a minimal VocabWord stub
// ---------------------------------------------------------------------------
function makeWord(
  id: string,
  originLevel: GradeLevel,
  type: "fiil" | "ism",
  language: "arabic" = "arabic"
): VocabWord {
  return {
    id,
    language,
    word: `كلمة-${id}`,
    latin: `kalimah-${id}`,
    meaning: `Arti kata ${id}`,
    sentences: [
      {
        id: `s-${id}`,
        sentence: `جملة ${id}`,
        latin: `jumlah ${id}`,
        meaning: `Kalimat contoh ${id}`,
      },
    ],
    originLevel,
    difficulty: Number(originLevel[0]) as 1 | 2 | 3 | 4 | 5 | 6,
    type,
    tags: ["test"],
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

// ===================================================================
// TEST SUITE: pickDailyWords
// ===================================================================
describe("pickDailyWords — Fisher-Yates", () => {
  const pool: VocabWord[] = Array.from({ length: 10 }, (_, i) =>
    makeWord(`w${i}`, "1SMP", "ism")
  );

  it("returns exactly `count` words from a sufficiently large pool", () => {
    const result = pickDailyWords(pool, 3);
    expect(result).toHaveLength(3);
  });

  it("returns the entire pool when pool.length < count (no crash)", () => {
    const smallPool = [makeWord("only1", "1SMP", "ism"), makeWord("only2", "1SMP", "ism")];
    const result = pickDailyWords(smallPool, 3);
    expect(result).toHaveLength(2);
  });
});

// ===================================================================
// TEST SUITE: generateDailyContent — Strict Composition (1 Fi'il + 2 Ism)
// ===================================================================
describe("generateDailyContent — Strict Composition", () => {
  const words: VocabWord[] = [
    makeWord("f1", "1SMP", "fiil"),
    makeWord("f2", "1SMP", "fiil"),
    makeWord("i1", "1SMP", "ism"),
    makeWord("i2", "1SMP", "ism"),
    makeWord("i3", "1SMP", "ism"),
  ];

  it("produces a DailyContent with exactly 1 Fi'il and 2 Ism words", () => {
    const { dailyContent } = generateDailyContent(
      "1SMP",
      "u-test",
      "2026-07-07",
      words,
      [],
      "auto"
    );

    const picked = dailyContent.arabicWords;
    expect(picked).toHaveLength(3);

    const fiils = picked.filter((w) => w.type === "fiil");
    const isms = picked.filter((w) => w.type === "ism");

    expect(fiils).toHaveLength(1);
    expect(isms).toHaveLength(2);
    expect(dailyContent.level).toBe("1SMP");
  });

  it("appends new usage records for all 3 picked words", () => {
    const { newUsageRecords } = generateDailyContent(
      "1SMP",
      "u-test",
      "2026-07-07",
      words,
      [],
      "manual"
    );
    expect(newUsageRecords).toHaveLength(3);
    for (const record of newUsageRecords) {
      expect(record.usedInLevel).toBe("1SMP");
      expect(record.language).toBe("arabic");
    }
  });

  it("preserves existing usage records in the returned array", () => {
    const existingUsage = [makeUsage("old-word", "1SMP")];
    const { newUsageRecords } = generateDailyContent(
      "1SMP",
      "u-test",
      "2026-07-07",
      words,
      existingUsage,
      "auto"
    );
    expect(newUsageRecords).toHaveLength(4);
    expect(newUsageRecords[0].wordId).toBe("old-word");
  });
});

// ===================================================================
// TEST SUITE: Unique Rotation
// ===================================================================
describe("generateDailyContent — Unique Rotation Rule", () => {
  const words: VocabWord[] = [
    makeWord("f1", "1SMP", "fiil"),
    makeWord("f2", "1SMP", "fiil"),
    makeWord("i1", "1SMP", "ism"),
    makeWord("i2", "1SMP", "ism"),
    makeWord("i3", "1SMP", "ism"),
    makeWord("i4", "1SMP", "ism"),
  ];

  it("excludes specified word IDs to prevent consecutive duplicate selections", () => {
    // Current shown words are: f1, i1, i2
    const excludeIds = new Set(["f1", "i1", "i2"]);

    const { dailyContent } = generateDailyContent(
      "1SMP",
      "u-test",
      "2026-07-07",
      words,
      [],
      "manual",
      excludeIds
    );

    const picked = dailyContent.arabicWords;
    // Should select f2 (the only other fiil) and i3/i4 (the other isms)
    expect(picked.find((w) => w.id === "f1")).toBeUndefined();
    expect(picked.find((w) => w.id === "i1")).toBeUndefined();
    expect(picked.find((w) => w.id === "i2")).toBeUndefined();

    expect(picked.find((w) => w.id === "f2")).toBeDefined();
    expect(picked.find((w) => w.id === "i3")).toBeDefined();
    expect(picked.find((w) => w.id === "i4")).toBeDefined();
  });

  it("falls back gracefully if rotation constraints cannot be satisfied", () => {
    // If we only have 1 fiil ("f1") and we try to exclude it, rotation cannot be fully satisfied
    const limitedWords = [
      makeWord("f1", "1SMP", "fiil"),
      makeWord("i1", "1SMP", "ism"),
      makeWord("i2", "1SMP", "ism"),
    ];
    const excludeIds = new Set(["f1"]);

    const { dailyContent } = generateDailyContent(
      "1SMP",
      "u-test",
      "2026-07-07",
      limitedWords,
      [],
      "manual",
      excludeIds
    );

    // It should fall back to using "f1" instead of failing/crashing
    expect(dailyContent.arabicWords.map((w) => w.id)).toContain("f1");
  });
});

// ===================================================================
// TEST SUITE: Auto-Reset Simulation
// ===================================================================
describe("Auto-Reset — Pool Depletion by Composition Type", () => {
  it("clears usage records when fiil pool has less than 1 word", () => {
    const words: VocabWord[] = [
      makeWord("f1", "1SMP", "fiil"),
      makeWord("i1", "1SMP", "ism"),
      makeWord("i2", "1SMP", "ism"),
      makeWord("i3", "1SMP", "ism"),
    ];

    // f1 is used up
    let usageRecords = [makeUsage("f1", "1SMP")];

    // Check pool for fiil is 0
    let pool = getAvailableWords(words, usageRecords, "1SMP", "arabic");
    let fiils = pool.filter((w) => w.type === "fiil");
    expect(fiils).toHaveLength(0);

    // Enforce reset condition: fiilPool.length < 1
    if (fiils.length < 1) {
      usageRecords = usageRecords.filter((r) => r.usedInLevel !== "1SMP");
    }

    // Restored pool
    pool = getAvailableWords(words, usageRecords, "1SMP", "arabic");
    fiils = pool.filter((w) => w.type === "fiil");
    expect(fiils).toHaveLength(1);
  });

  it("clears usage records when ism pool has less than 2 words", () => {
    const words: VocabWord[] = [
      makeWord("f1", "1SMP", "fiil"),
      makeWord("i1", "1SMP", "ism"),
      makeWord("i2", "1SMP", "ism"),
      makeWord("i3", "1SMP", "ism"),
    ];

    // i1 and i2 are used up, only i3 is left (1 word left, which is < 2)
    let usageRecords = [makeUsage("i1", "1SMP"), makeUsage("i2", "1SMP")];

    let pool = getAvailableWords(words, usageRecords, "1SMP", "arabic");
    let isms = pool.filter((w) => w.type === "ism");
    expect(isms).toHaveLength(1);

    // Enforce reset condition: ismPool.length < 2
    if (isms.length < 2) {
      usageRecords = usageRecords.filter((r) => r.usedInLevel !== "1SMP");
    }

    // Restored pool
    pool = getAvailableWords(words, usageRecords, "1SMP", "arabic");
    isms = pool.filter((w) => w.type === "ism");
    expect(isms).toHaveLength(3);
  });
});
