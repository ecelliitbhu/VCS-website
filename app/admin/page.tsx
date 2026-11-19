import { auth, supabase } from "@/auth";
import { vcsDb } from "@/lib/supabase";
import { getActiveCohort, getAssessments } from "@/lib/cohort";
import ScoreEditor from "./ScoreEditor";
import RoleToggle from "./RoleToggle";
import DeleteUser from "./DeleteUser";
import UploadScores from "./UploadScores";

export default async function Page() {
  const session = await auth();
  if (!session || !session.user) return <div className="p-8">Unauthorized</div>;

  // fetch role directly to be certain
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("email", session.user.email)
    .maybeSingle();
  if (!profile || profile.role !== "admin")
    return <div className="p-8">Forbidden</div>;

  const cohort = await getActiveCohort();
  if (!cohort) return <div className="p-8">No active cohort. Create one in the cohorts table.</div>;

  const [{ data: usersData }, { data: enrollData }, assessments] =
    await Promise.all([
      supabase.from("users").select("email, name, image, role"),
      vcsDb.from("enrollments").select("*").eq("cohort_id", cohort.id),
      getAssessments(cohort.id),
    ]);

  const enrollments = enrollData || [];
  const { data: scoreData } = enrollments.length
    ? await vcsDb
        .from("assessment_scores")
        .select("enrollment_id, assessment_id, score")
        .in("enrollment_id", enrollments.map((e: any) => e.id))
    : { data: [] as any[] };
  const scoresData = scoreData || [];

  const usersList = (usersData || []).map((u: any) => {
    const e: any = enrollments.find((x: any) => x.user_email === u.email);
    return {
      email: u.email,
      name: e?.full_name ?? u.name,
      image: u.image,
      role: u.role ?? "user",
      institution: e?.institution,
      current_year: e?.current_year,
      course: e?.course,
      branch: e?.branch,
      phone_number: e?.phone_number,
      registered_course_id: e ? cohort.id : null,
      scores: e
        ? scoresData
            .filter((s: any) => s.enrollment_id === e.id)
            .reduce((acc: any, s: any) => ({ ...acc, [s.assessment_id]: s.score }), {})
        : {},
    };
  });

  // sort admins first
  usersList.sort((a: any, b: any) => {
    if (a.role === b.role)
      return (a.name || "").localeCompare(b.name || "");
    if (a.role === "admin") return -1;
    if (b.role === "admin") return 1;
    return (a.name || "").localeCompare(b.name || "");
  });

  const users = usersList;

  return (
    <div className="mx-auto max-w-[96rem] px-4 pb-12 pt-8 md:px-8">
      <p className="scout-eyebrow mb-3">Admin</p>
      <h1 className="scout-heading text-3xl md:text-4xl mb-8">Users &amp; scores <span className="font-mono text-sm font-medium tracking-normal text-[#94A3B8]">/ {cohort.name}</span></h1>
      <span>
        <UploadScores />
      </span>
      <div className="mt-6 overflow-auto border border-white/[0.08] rounded-[2px] bg-[#0D2136]/60">
        <table className="min-w-full table-auto border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[#94A3B8]">
              <th className="px-2 py-1 min-w-80">Name</th>
              <th className="px-2 py-1 min-w-80">Email</th>
              <th className="px-2 py-1 min-w-40">Role</th>
              <th className="px-2 py-1 min-w-40">Institution</th>
              <th className="px-2 py-1 min-w-32">Year</th>
              <th className="px-2 py-1 min-w-32">Course</th>
              <th className="px-2 py-1 min-w-40">Branch</th>
              <th className="px-2 py-1 min-w-40">Phone</th>
              <th className="px-2 py-1 min-w-52">Registered</th>
              {assessments.map((a) => (
                <th key={a.id} className="px-3 py-1 min-w-40">
                  {a.title} (/{a.max_score})
                </th>
              ))}
              <th className="px-2 py-1 min-w-48">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr
                key={u.email}
                className="hover:bg-white/[0.03] border-b border-white/[0.06] h-16"
              >
                <td className="px-2 py-1">{u.name}</td>
                <td className="px-2 py-1">{u.email}</td>
                <td className="px-2 py-1">
                  <div className="flex justify-center items-center">
                    <span
                      className={`min-w-16 px-3 py-1 text-xs font-bold rounded-[2px] font-mono uppercase tracking-wider text-center ${
                        u.role === "admin"
                          ? "text-[#ff9a62] bg-[#F86531]/10 border border-[#F86531]/40"
                          : "text-[#94A3B8] border border-white/[0.12]"
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-1">
                  {u.institution || "-"}
                </td>
                <td className="px-2 py-1">
                  {u.current_year || "-"}
                </td>
                <td className="px-2 py-1">{u.course || "-"}</td>
                <td className="px-2 py-1">{u.branch || "-"}</td>
                <td className="px-2 py-1">
                  {u.phone_number || "-"}
                </td>
                <td className="px-2 py-1">
                  {u.registered_course_id ? (
                    <a className="text-[#F86531] hover:underline" href={`/course`}>
                      {u.registered_course_id}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                {assessments.map((a) => (
                  <td key={a.id} className="px-3 py-1">
                    {u.registered_course_id ? (
                      <ScoreEditor
                        userEmail={u.email}
                        assessmentId={a.id}
                        initialScore={u.scores?.[a.id] ?? null}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                ))}
                <td className="px-2 py-1">
                  <div className="flex justify-center items-center gap-4">
                    <RoleToggle email={u.email} currentRole={u.role} />
                    <DeleteUser email={u.email} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
