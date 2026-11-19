/**
 * COURSE SCHEDULE: the only thing you need to edit.
 *
 * Set COURSE_DAY_ONE to the calendar date of Day 1 (format "YYYY-MM-DD", IST).
 * Every other day unlocks automatically at 00:00 IST on (Day 1 + N - 1):
 *   Day 1 = COURSE_DAY_ONE, Day 2 = next day, ... Day 7 = six days after, etc.
 * A module unlocks when its first lesson day arrives (Module 1 -> Day 1,
 * Module 2 -> Day 4, Module 3 -> Day 7, Module 4 -> Day 12). Lessons inside a
 * module unlock one by one on their own day.
 *
 * While this is null, every module/lesson shows "Schedule to be announced".
 * Admins always see everything unlocked.
 */
export const COURSE_DAY_ONE: string | null = null; // e.g. "2026-12-01"

/**
 * TEMPORARY PREVIEW SWITCH: while true, every module and lesson is open for
 * everyone regardless of dates. Set to false to go back to day-wise unlocking.
 */
export const UNLOCK_ALL = true;

const IST_OFFSET = "+05:30";
const DAY_MS = 24 * 60 * 60 * 1000;

/** Epoch ms at which course day `n` unlocks (00:00 IST), or null if Day 1 isn't set. */
export function dayUnlockTime(n: number): number | null {
  if (!COURSE_DAY_ONE) return null;
  const start = Date.parse(`${COURSE_DAY_ONE}T00:00:00${IST_OFFSET}`);
  if (Number.isNaN(start)) return null;
  return start + (n - 1) * DAY_MS;
}

export function isDayUnlocked(n: number, now: number, isAdmin = false): boolean {
  if (UNLOCK_ALL || isAdmin) return true;
  const t = dayUnlockTime(n);
  return t !== null && now >= t;
}

/** "Day 12" -> 12 */
export function parseDayNumber(label: string): number {
  const m = label.match(/\d+/);
  return m ? Number(m[0]) : 1;
}

/** "Days 4–5" -> 4 (first lesson day of a module) */
export function moduleFirstDay(dayRange: string): number {
  return parseDayNumber(dayRange);
}

/** "Unlocks Fri, 4 Dec" (IST), or "Unlock schedule to be announced" when Day 1 isn't set. */
export function unlockLabel(n: number): string {
  return dayUnlockTime(n) === null
    ? "Unlock schedule to be announced"
    : `Unlocks ${formatUnlock(n)}`;
}

/** "Fri, 4 Dec" in IST, or "Schedule to be announced" when Day 1 isn't set. */
export function formatUnlock(n: number): string {
  const t = dayUnlockTime(n);
  if (t === null) return "Schedule to be announced";
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(t));
}
