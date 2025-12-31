import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  id: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET: which course the user is registered in + their profile data
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> }
): Promise<NextResponse> {
  const { id } = await params;

  // id is email in this route; look up user profile data
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("full_name, institution, current_year, course, branch, phone_number")
    .eq("email", id)
    .maybeSingle();

  if (userError && userError.code !== "PGRST116") {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  // Look up registration data
  const { data: registrationData, error: regError } = await supabase
    .from("registrations")
    .select("course_id")
    .eq("user_email", id)
    .maybeSingle();

  if (regError && regError.code !== "PGRST116") {
    return NextResponse.json({ error: regError.message }, { status: 500 });
  }

  // Combine both pieces of data
  return NextResponse.json({
    full_name: userData?.full_name ?? null,
    institution: userData?.institution ?? null,
    current_year: userData?.current_year ?? null,
    course: userData?.course ?? null,
    branch: userData?.branch ?? null,
    phone_number: userData?.phone_number ?? null,
    registered_course_id: registrationData?.course_id ?? null,
  });
}
