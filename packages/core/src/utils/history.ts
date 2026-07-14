import { DailyContent, GradeLevel } from "../types";
import { getLocalDateString } from "./date";
import { storage, STORAGE_KEYS } from "./storage";

/**
 * Searches the past 30 days of localStorage entries for previous vocabulary sheets.
 * Returns them sorted newest first.
 */
export function getHistoryForLevel(
  level: GradeLevel,
  daysBack: number = 30
): DailyContent[] {
  const results: DailyContent[] = [];
  const today = new Date();

  for (let i = 1; i <= daysBack; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);
    
    const key = STORAGE_KEYS.daily(level, dateStr);
    const cached = storage.get<DailyContent>(key);
    
    if (cached) {
      results.push(cached);
    }
  }

  // Sort by date string descending (latest first)
  return results.sort((a, b) => b.date.localeCompare(a.date));
}
