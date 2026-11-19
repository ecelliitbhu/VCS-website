// app/api/admin/upload-scores/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, supabase } from "@/auth";
import { vcsDb } from "@/lib/supabase";
import { getActiveCohort, getAssessments } from "@/lib/cohort";

// Expected sheet headers: email | assessment (key, e.g. m3-quiz) | score
type SheetRow = {
  email: string;
  assessment: string;
  score: string | number;
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("email", session.user.email)
    .maybeSingle();

  if (profileError) {
    console.error("Profile fetch error:", profileError);
    return NextResponse.json({ error: "Profile lookup failed" }, { status: 500 });
  }

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse body
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rows = body?.rows as SheetRow[];
  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const cohort = await getActiveCohort();
  if (!cohort) return NextResponse.json({ error: "No active cohort" }, { status: 409 });

  const [{ data: enrollData }, assessments] = await Promise.all([
    vcsDb.from("enrollments").select("id, user_email").eq("cohort_id", cohort.id),
    getAssessments(cohort.id),
  ]);
  const enrollByEmail = new Map(
    (enrollData ?? []).map((e: any) => [String(e.user_email).toLowerCase(), e.id as string])
  );
  const assessmentByKey = new Map(assessments.map((a) => [a.key, a.id]));

  // Deduplicate by (enrollment, assessment) and normalize score like "7 / 10" -> 7
  const map = new Map<string, any>();
  const skipped: string[] = [];

  for (const r of rows) {
    if (!r.email || !r.assessment) continue;
    const enrollmentId = enrollByEmail.get(String(r.email).trim().toLowerCase());
    const assessmentId = assessmentByKey.get(String(r.assessment).trim());
    if (!enrollmentId || !assessmentId) {
      skipped.push(`${r.email}/${r.assessment}`);
      continue;
    }

    const numericPart = String(r.score ?? "").trim().split("/")[0].trim();
    const score =
      numericPart === "" || Number.isNaN(Number(numericPart)) ? null : Number(numericPart);

    // later rows overwrite earlier ones for the same enrollment+assessment
    map.set(`${enrollmentId}__${assessmentId}`, {
      enrollment_id: enrollmentId,
      assessment_id: assessmentId,
      score,
      graded_by: session.user.email,
      updated_at: new Date().toISOString(),
    });
  }

  const payload = Array.from(map.values());
  if (payload.length === 0) {
    return NextResponse.json(
      { error: "No valid rows (unknown email or assessment key?)", skipped },
      { status: 400 }
    );
  }

  const { error } = await vcsDb
    .from("assessment_scores")
    .upsert(payload, { onConflict: "enrollment_id,assessment_id" });

  if (error) {
    console.error("Scores upsert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ updated: payload.length, skipped });
}
