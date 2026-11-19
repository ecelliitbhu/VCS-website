/**
 * SUBMISSION LINKS for the assignment boxes inside lessons.
 *
 * Add the form/upload URL for each assignment here. Anything left empty shows a
 * disabled "Submission link coming soon" button.
 *
 * Keys are `m<module>-<which>`:
 *   m1-day-1   Module 1, "Day 1 Assignment"
 *   m1-module  Module 1, the module assignment
 *   m2-module  Module 2 assignment            (Day 5)
 *   m3-module  Module 3 assignment briefing   (Day 9)
 *   m4-module  Module 4 Demo Day Analyst Pack (Day 14)
 */
export const ASSIGNMENT_LINKS: Record<string, string> = {
  // "m1-day-1": "https://forms.gle/...",
  // "m1-module": "https://forms.gle/...",
  // "m2-module": "https://forms.gle/...",
  // "m3-module": "https://forms.gle/...",
  // "m4-module": "https://forms.gle/...",
};

/** Replaces the submit slots emitted by the lesson renderer with a real button. */
export function withSubmitButtons(html: string, moduleNumber: number): string {
  return html.replace(
    /<p class="lesson-assignment__submit-slot" data-key="([^"]+)"><\/p>/g,
    (_match, key: string) => {
      const url = ASSIGNMENT_LINKS[`m${moduleNumber}-${key}`];
      return url
        ? `<a class="lesson-assignment__submit" href="${url}" target="_blank" rel="noopener noreferrer">Submit assignment &rarr;</a>`
        : `<span class="lesson-assignment__submit lesson-assignment__submit--pending">Submission link coming soon</span>`;
    }
  );
}
