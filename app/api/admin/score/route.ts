import { auth } from "@/auth";
import { supabase, vcsDb } from "@/lib/supabase";
import { getActiveCohort, getEnrollment } from "@/lib/cohort";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if ((session as any).user?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const { user_email, assessment_id, score } = await req.json();
    if (!user_email || !assessment_id) return NextResponse.json({ error: "user_email and assessment_id required" }, { status: 400 });

    const cohort = await getActiveCohort();
    if (!cohort) return NextResponse.json({ error: "no active cohort" }, { status: 409 });
    const enrollment = await getEnrollment(user_email, cohort.id);
    if (!enrollment) return NextResponse.json({ error: "user not enrolled in active cohort" }, { status: 404 });

    // the assessment must belong to the active cohort
    const { data: assessment } = await vcsDb.from("assessments").select("id").eq("id", assessment_id).eq("cohort_id", cohort.id).maybeSingle();
    if (!assessment) return NextResponse.json({ error: "assessment not in active cohort" }, { status: 404 });

    const { error } = await vcsDb.from("assessment_scores").upsert(
        { enrollment_id: enrollment.id, assessment_id, score, graded_by: session.user.email, updated_at: new Date().toISOString() },
        { onConflict: "enrollment_id,assessment_id" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
