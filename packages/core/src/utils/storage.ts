import { GradeLevel } from "../types";

export const STORAGE_KEYS = {
  AUTH: "auth_session",
  PORTION: (level: GradeLevel) => `portion_${level}`,
  PORTION_HISTORY: (level: GradeLevel) => `portion_history_${level}`,
} as const;

export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === "undefined" || !window.localStorage) return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage set error:", e);
    }
  },

  remove: (key: string): void => {
    if (typeof window === "undefined" || !window.localStorage) return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Storage remove error:", e);
    }
  },
};
export default storage;
