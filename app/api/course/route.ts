import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// GET: which course the user is registered in
export async function GET(req: NextRequest): Promise<NextResponse> {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { data, error } = await supabase.from("users").select("registered_course_id").eq("id", session.user.id).single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ registered_course_id: data?.registered_course_id });
}

// POST: register user to a course
export async function POST(req: NextRequest): Promise<NextResponse> {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const formData = await req.formData();

    const course_id = formData.get("course_id") as string;
    if (!course_id) return NextResponse.json({ error: "course_id required" }, { status: 400 });

    // ensure user not already registered
    const { data: existing } = await supabase.from("users").select("registered_course_id").eq("email", session.user.email).single();

    if (existing?.registered_course_id) return NextResponse.redirect("/course");

    await supabase.from("users").update({ registered_course_id: course_id }).eq("email", session.user.email);

    return NextResponse.redirect(new URL("/course", req.url), { status: 303 });
}
