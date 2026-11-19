import { auth } from "@/auth";
import { getActiveCohort, getEnrollment } from "@/lib/cohort";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  id: string;
}

// GET: the signed-in user's enrollment (profile) in the active cohort.
// `id` is the email; users may only read their own record.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> }
): Promise<NextResponse> {
  const { id } = await params;
  const email = decodeURIComponent(id);

  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.user.email !== email && (session.user as any).role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const cohort = await getActiveCohort();
  const enrollment = cohort ? await getEnrollment(email, cohort.id) : null;

  return NextResponse.json({
    full_name: enrollment?.full_name ?? null,
    institution: enrollment?.institution ?? null,
    current_year: enrollment?.current_year ?? null,
    course: enrollment?.course ?? null,
    branch: enrollment?.branch ?? null,
    phone_number: enrollment?.phone_number ?? null,
    track: enrollment?.track ?? null,
    cohort_id: cohort?.id ?? null,
    registered_course_id: enrollment ? cohort!.id : null,
    needs_signup: !enrollment,
  });
}
