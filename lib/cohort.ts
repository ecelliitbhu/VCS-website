import { supabase, vcsDb } from "@/lib/supabase";

export interface Cohort {
  id: string;
  year: number;
  name: string;
  registration_open: boolean;
  is_active: boolean;
}

export interface Enrollment {
  id: string;
  cohort_id: string;
  user_email: string;
  track: "basic" | "advanced" | null;
  full_name: string;
  institution: string;
  current_year: string;
  course: string;
  branch: string;
  phone_number: string;
}

export interface Assessment {
  id: string;
  cohort_id: string;
  key: string;
  module: number | null;
  kind: "quiz" | "assignment" | "hackathon";
  title: string;
  max_score: number;
  weight: number | null;
  track: "basic" | "advanced" | null;
  url: string | null;
  due_date: string | null;
  sort_order: number;
}

/** The single cohort currently running (is_active = true), or null. */
export async function getActiveCohort(): Promise<Cohort | null> {
  const { data, error } = await vcsDb
    .from("cohorts")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();
  if (error) console.error("getActiveCohort error:", error);
  return (data as Cohort) ?? null;
}

export async function getEnrollment(
  email: string,
  cohortId: string
): Promise<Enrollment | null> {
  const { data, error } = await vcsDb
    .from("enrollments")
    .select("*")
    .eq("cohort_id", cohortId)
    .eq("user_email", email)
    .maybeSingle();
  if (error) console.error("getEnrollment error:", error);
  return (data as Enrollment) ?? null;
}

/** Assessments for a cohort, filtered to what applies to the given track. */
export async function getAssessments(
  cohortId: string,
  track?: "basic" | "advanced" | null
): Promise<Assessment[]> {
  const { data, error } = await vcsDb
    .from("assessments")
    .select("*")
    .eq("cohort_id", cohortId)
    .order("sort_order", { ascending: true });
  if (error) console.error("getAssessments error:", error);
  const all = (data as Assessment[]) ?? [];
  return track === undefined
    ? all
    : all.filter((a) => a.track === null || a.track === track);
}
