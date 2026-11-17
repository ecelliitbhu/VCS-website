import { supabase } from "@/auth";

/**
 * Bump this whenever every user must fill the signup form again.
 * A user is fully signed up when users.signup_version >= this value.
 */
export const CURRENT_SIGNUP_VERSION = 2;

export type UserStatus = "no-session" | "unregistered" | "registered";

export function isSignupCurrent(signupVersion: number | null | undefined) {
  return (signupVersion ?? 0) >= CURRENT_SIGNUP_VERSION;
}

/**
 * Single source of truth for a user's registration status (server only).
 * "registered" requires both a course registration AND an up-to-date signup.
 */
export async function getUserStatus(
  email: string | null | undefined
): Promise<UserStatus> {
  if (!email) return "no-session";

  const [userRes, regRes] = await Promise.all([
    supabase
      .from("users")
      .select("signup_version")
      .eq("email", email)
      .maybeSingle(),
    supabase
      .from("registrations")
      .select("course_id")
      .eq("user_email", email)
      .maybeSingle(),
  ]);

  if (userRes.error) console.error("getUserStatus users error:", userRes.error);
  if (regRes.error) console.error("getUserStatus registrations error:", regRes.error);

  const hasRegistration = !!regRes.data?.course_id;
  const signupCurrent = isSignupCurrent(userRes.data?.signup_version);

  return hasRegistration && signupCurrent ? "registered" : "unregistered";
}
