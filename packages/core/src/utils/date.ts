/**
 * Converts a Date object to a "YYYY-MM-DD" string based on the device's LOCAL timezone.
 * Used to avoid UTC midnight date shifts.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
}

/**
 * Returns the current date as a YYYY-MM-DD string in the device's local timezone.
 */
export function getLocalTodayString(): string {
  return getLocalDateString(new Date());
}

/**
 * Formats a YYYY-MM-DD date string into a user-friendly Indonesian format.
 * Example: "2026-07-06" -> "Senin, 6 Juli 2026"
 */
export function formatIndonesianDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  // Create a local Date at noon to avoid boundary timezone issues
  const date = new Date(year, month - 1, day, 12, 0, 0);
  
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  
  return `${dayName}, ${day} ${monthName} ${year}`;
}
