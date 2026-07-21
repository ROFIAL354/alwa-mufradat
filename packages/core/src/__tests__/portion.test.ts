import { describe, it, expect } from "vitest";
import {
  getPortionNumberFromId,
  getPortionForLevel,
  getMaxPortion,
} from "../utils/portion";
import { VocabWord, GradeLevel } from "../types";

function makeWord(id: string, originLevel: GradeLevel): VocabWord {
  return {
    id,
    language: "arabic",
    word: "كلمة",
    latin: "kalimah",
    meaning: "Arti",
    sentences: [],
    originLevel,
    difficulty: 1,
    type: "ism",
    createdAt: "2026-01-01T00:00:00Z",
  };
}

describe("portion engine", () => {
  it("getPortionNumberFromId correctly parses IDs", () => {
    expect(getPortionNumberFromId("w-1smp-p140-3")).toBe(140);
    expect(getPortionNumberFromId("w-2smp-p5-1")).toBe(5);
    expect(getPortionNumberFromId("invalid-id")).toBe(1);
  });

  it("getPortionForLevel filters words correctly", () => {
    const words = [
      makeWord("w-1smp-p1-1", "1SMP"),
      makeWord("w-1smp-p1-2", "1SMP"),
      makeWord("w-1smp-p2-1", "1SMP"),
      makeWord("w-2smp-p1-1", "2SMP"),
    ];

    const result = getPortionForLevel("1SMP", words, 1);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("w-1smp-p1-1");
    expect(result[1].id).toBe("w-1smp-p1-2");
  });

  it("getMaxPortion computes maximum portion number correctly", () => {
    const words = [
      makeWord("w-1smp-p1-1", "1SMP"),
      makeWord("w-1smp-p20-1", "1SMP"),
      makeWord("w-1smp-p140-3", "1SMP"),
      makeWord("w-2smp-p5-1", "2SMP"),
    ];

    expect(getMaxPortion("1SMP", words)).toBe(140);
    expect(getMaxPortion("2SMP", words)).toBe(5);
  });
});
