import { DailyContent, GradeLevel, VocabWord, WordUsageRecord } from "../types";
import { getLocalTodayString } from "./date";
import { storage, STORAGE_KEYS } from "./storage";
import { getAvailableWords } from "./cascade";

/**
 * Shuffles a pool of words using the unbiased Fisher-Yates algorithm
 * and returns the requested number of elements.
 */
export function pickDailyWords(pool: VocabWord[], count: number = 3): VocabWord[] {
  if (pool.length < count) {
    return pool; // Do not crash, return whatever is left in the pool
  }

  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.slice(0, count);
}

/**
 * Low-level utility to generate daily content and append usage records.
 * Ensures the composition rules: exactly 1 Fi'il and 2 Ism words.
 * Also handles unique rotation by optionally excluding previously displayed word IDs.
 */
export function generateDailyContent(
  level: GradeLevel,
  ustadzId: string,
  dateStr: string,
  allWords: VocabWord[],
  usageRecords: WordUsageRecord[],
  by: "auto" | "manual",
  excludeIds?: Set<string>
): { dailyContent: DailyContent; newUsageRecords: WordUsageRecord[] } {
  const arabicPool = getAvailableWords(allWords, usageRecords, level, "arabic");

  let fiilPool = arabicPool.filter((w) => w.type === "fiil");
  let ismPool = arabicPool.filter((w) => w.type === "ism");

  // Apply unique rotation rule (exclude current/previous words) if possible
  if (excludeIds && excludeIds.size > 0) {
    const rotatedFiil = fiilPool.filter((w) => !excludeIds.has(w.id));
    const rotatedIsm = ismPool.filter((w) => !excludeIds.has(w.id));

    // Fall back to full pools only if rotation would break the composition constraint
    if (rotatedFiil.length >= 1) {
      fiilPool = rotatedFiil;
    }
    if (rotatedIsm.length >= 2) {
      ismPool = rotatedIsm;
    }
  }

  const pickedFiil = pickDailyWords(fiilPool, 1);
  const pickedIsm = pickDailyWords(ismPool, 2);
  const pickedWords = [...pickedFiil, ...pickedIsm];

  const dailyContent: DailyContent = {
    id: `dc-${level}-${dateStr}-${Date.now()}`,
    date: dateStr,
    level,
    ustadzId,
    arabicWords: pickedWords,
    generatedAt: new Date().toISOString(),
    generatedBy: by,
  };

  const newRecords: WordUsageRecord[] = pickedWords.map((word) => ({
    id: `ur-${level}-${word.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    wordId: word.id,
    language: "arabic",
    usedInLevel: level,
    usedAt: dateStr,
    ustadzId,
  }));

  return {
    dailyContent,
    newUsageRecords: [...usageRecords, ...newRecords],
  };
}

/**
 * Main engine entry for retrieving daily content. Pulls from cache if exists,
 * otherwise triggers auto-generation.
 * Triggers a partial auto-reset if pools are depleted (less than 1 fiil or 2 isms).
 */
export function loadDailyContent(
  level: GradeLevel,
  ustadzId: string,
  allWords: VocabWord[]
): DailyContent {
  const today = getLocalTodayString();
  const dailyKey = STORAGE_KEYS.daily(level, today);
  const cached = storage.get<DailyContent>(dailyKey);

  if (cached) {
    return cached;
  }

  let usageRecords = storage.get<WordUsageRecord[]>(STORAGE_KEYS.USAGE) ?? [];
  let arabicPool = getAvailableWords(allWords, usageRecords, level, "arabic");
  let fiilPool = arabicPool.filter((w) => w.type === "fiil");
  let ismPool = arabicPool.filter((w) => w.type === "ism");

  // Partial auto-reset if pool is depleted for 1 Fi'il + 2 Ism composition
  if (fiilPool.length < 1 || ismPool.length < 2) {
    usageRecords = usageRecords.filter((r) => r.usedInLevel !== level);
    storage.set(STORAGE_KEYS.USAGE, usageRecords);
  }

  const { dailyContent, newUsageRecords } = generateDailyContent(
    level,
    ustadzId,
    today,
    allWords,
    usageRecords,
    "auto"
  );

  storage.set(dailyKey, dailyContent);
  storage.set(STORAGE_KEYS.USAGE, newUsageRecords);

  return dailyContent;
}

/**
 * Manually forces a content refresh. If the available word pool is low,
 * it performs a partial reset (clearing the usage records for this level)
 * to prevent locking or hard crashes.
 * Enforces the rotation rule: new words must be completely different from the previous words.
 */
export function forceRefreshDailyContent(
  level: GradeLevel,
  ustadzId: string,
  allWords: VocabWord[]
): DailyContent {
  const today = getLocalTodayString();
  const dailyKey = STORAGE_KEYS.daily(level, today);

  // Capture currently displayed words to exclude them for unique rotation
  const currentDaily = storage.get<DailyContent>(dailyKey);
  const excludeIds = new Set<string>();
  if (currentDaily) {
    currentDaily.arabicWords.forEach((w) => excludeIds.add(w.id));
  }

  storage.remove(dailyKey); // Invalidate cache for today

  let usageRecords = storage.get<WordUsageRecord[]>(STORAGE_KEYS.USAGE) ?? [];
  let arabicPool = getAvailableWords(allWords, usageRecords, level, "arabic");
  let fiilPool = arabicPool.filter((w) => w.type === "fiil");
  let ismPool = arabicPool.filter((w) => w.type === "ism");

  // Partial auto-reset when pools are critically low (need at least 1 fiil and 2 isms)
  if (fiilPool.length < 1 || ismPool.length < 2) {
    usageRecords = usageRecords.filter((r) => r.usedInLevel !== level);
    storage.set(STORAGE_KEYS.USAGE, usageRecords);
  }

  // Generate new content excluding previous IDs for rotation
  const { dailyContent, newUsageRecords } = generateDailyContent(
    level,
    ustadzId,
    today,
    allWords,
    usageRecords,
    "manual",
    excludeIds
  );

  storage.set(dailyKey, dailyContent);
  storage.set(STORAGE_KEYS.USAGE, newUsageRecords);

  return dailyContent;
}

