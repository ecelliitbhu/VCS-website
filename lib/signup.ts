import { getActiveCohort, getEnrollment } from "@/lib/cohort";

export type UserStatus = "no-session" | "unregistered" | "registered";

/**
 * Single source of truth for a user's registration status (server only).
 * "registered" means the user has an enrollment in the ACTIVE cohort.
 * A new year = a new cohort row, so everyone must sign up again automatically.
 */
export async function getUserStatus(
  email: string | null | undefined
): Promise<UserStatus> {
  if (!email) return "no-session";

  const cohort = await getActiveCohort();
  if (!cohort) return "unregistered";

  const enrollment = await getEnrollment(email, cohort.id);
  return enrollment ? "registered" : "unregistered";
}
