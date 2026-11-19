import { createClient } from "@supabase/supabase-js";

// Server-only client. Prefer the service-role key (bypasses RLS, never sent to
// the browser). Falls back to the anon key so local dev keeps working until
// SUPABASE_SERVICE_ROLE_KEY is set; with RLS enabled the fallback will fail.
// Accepts both the legacy names (anon / service_role) and the new ones
// (publishable / secret key).
const secretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const key = (secretKey ?? publicKey)!;

if (!secretKey) {
  console.warn(
    "SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY is not set; using the public key. Reads of the vcs_2026_schema tables will fail."
  );
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  key,
  { auth: { persistSession: false } }
);

/** Postgres schema holding this year's tables (cohorts, enrollments, assessments, assessment_scores). */
export const VCS_SCHEMA = "vcs_2026_schema";

/** Same client, scoped to the VCS schema. `users` stays in `public` (use `supabase`). */
export const vcsDb = supabase.schema(VCS_SCHEMA);
