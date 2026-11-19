import { auth } from "@/auth";
import { supabase, vcsDb } from "@/lib/supabase";
import { getActiveCohort, getEnrollment } from "@/lib/cohort";
import { NextRequest, NextResponse } from "next/server";

// POST: enroll the user in the active cohort OR update their existing enrollment
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const email = session.user.email;

  const body = await req.json();
  const { full_name, institution, current_year, course, branch, phone_number } = body;

  if (!full_name || !institution || !current_year || !course || !branch || !phone_number) {
    return NextResponse.json({ error: "all profile fields required" }, { status: 400 });
  }

  const cohort = await getActiveCohort();
  if (!cohort)
    return NextResponse.json({ error: "no active cohort" }, { status: 409 });

  const existing = await getEnrollment(email, cohort.id);

  // New enrollments are only allowed while registration is open;
  // existing ones may still update their profile.
  if (!existing && !cohort.registration_open)
    return NextResponse.json({ error: "registrations are closed" }, { status: 403 });

  const { error } = await vcsDb.from("enrollments").upsert(
    {
      cohort_id: cohort.id,
      user_email: email,
      full_name,
      institution,
      current_year,
      course,
      branch,
      phone_number,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "cohort_id,user_email" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    message: existing ? "Profile updated successfully" : "Registration successful",
  });
}
