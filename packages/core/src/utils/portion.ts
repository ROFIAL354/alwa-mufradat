import { GradeLevel, VocabWord } from "../types";
import { storage, STORAGE_KEYS } from "./storage";

/**
 * Extracts the portion number integer from a vocabulary word ID.
 * ID format: w-{grade}-p{portionNumber}-{index} (e.g. w-1smp-p140-3)
 */
export function getPortionNumberFromId(id: string): number {
  const parts = id.split("-");
  if (parts.length >= 3 && parts[2].startsWith("p")) {
    const num = parseInt(parts[2].slice(1), 10);
    if (!isNaN(num)) return num;
  }
  return 1;
}

/**
 * Retrieves the active portion number for a grade level from localStorage.
 * Defaults to 1 if not set.
 */
export function getCurrentPortion(level: GradeLevel): number {
  const saved = storage.get<number>(STORAGE_KEYS.PORTION(level));
  return saved !== null ? saved : 1;
}

/**
 * Persists the active portion number for a grade level to localStorage.
 */
export function setCurrentPortion(level: GradeLevel, portion: number): void {
  storage.set(STORAGE_KEYS.PORTION(level), portion);
}

/**
 * Filters a list of vocabulary words to return only those matching the specified portion number.
 * If portionNumber is omitted, it defaults to the active portion in localStorage.
 */
export function getPortionForLevel(
  level: GradeLevel,
  allWords: VocabWord[],
  portionNumber?: number
): VocabWord[] {
  const targetPortion = portionNumber !== undefined ? portionNumber : getCurrentPortion(level);
  return allWords.filter(
    (word) =>
      word.originLevel === level &&
      getPortionNumberFromId(word.id) === targetPortion
  );
}

/**
 * Scans all words for a given grade level to find the maximum portion number.
 */
export function getMaxPortion(level: GradeLevel, allWords: VocabWord[]): number {
  const portions = allWords
    .filter((word) => word.originLevel === level)
    .map((word) => getPortionNumberFromId(word.id));
  return portions.length > 0 ? Math.max(...portions) : 1;
}

/**
 * Retrieves the history of completed portion numbers for a grade level from localStorage.
 */
export function getPortionHistory(level: GradeLevel): number[] {
  const history = storage.get<number[]>(STORAGE_KEYS.PORTION_HISTORY(level));
  return Array.isArray(history) ? history : [];
}

/**
 * Appends a portion number to the completed portion history for a grade level.
 * Stores sorted descending (latest first).
 */
export function addPortionToHistory(level: GradeLevel, portion: number): void {
  const history = getPortionHistory(level);
  if (!history.includes(portion)) {
    const updated = [...history, portion].sort((a, b) => b - a);
    storage.set(STORAGE_KEYS.PORTION_HISTORY(level), updated);
  }
}
