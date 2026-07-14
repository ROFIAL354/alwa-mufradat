import { GradeLevel, Language, VocabWord, WordUsageRecord } from "../types";

/**
 * Filters a pool of vocabulary words based on grade group isolation and
 * the "upward cascade" rule. Lower level words can ascend as review (murajaah) 
 * for higher classes in the same group, but not vice-versa, and group boundaries are respected.
 */
export function getAvailableWords(
  allWords: VocabWord[],
  usageRecords: WordUsageRecord[],
  targetLevel: GradeLevel,
  language: Language,
): VocabWord[] {
  // Extract word IDs that have already been shown in this target grade
  const usedWordIds = new Set(
    usageRecords
      .filter((r) => r.usedInLevel === targetLevel && r.language === language)
      .map((r) => r.wordId),
  );

  return allWords.filter((word) => {
    if (word.language !== language) return false;
    if (usedWordIds.has(word.id)) return false; // Already used in this grade

    // Strict Level Isolation: Only select words belonging to this exact grade level
    return word.originLevel === targetLevel;
  });
}

/**
 * Checks if two grade levels belong to the same school group (SMP or SMA).
 */
export function isSameSchoolGroup(a: GradeLevel, b: GradeLevel): boolean {
  const smp: GradeLevel[] = ["1SMP", "2SMP", "3SMP"];
  const sma: GradeLevel[] = ["1SMA", "2SMA", "3SMA"];
  return (
    (smp.includes(a) && smp.includes(b)) || (sma.includes(a) && sma.includes(b))
  );
}
