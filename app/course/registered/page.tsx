import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase, vcsDb } from "@/lib/supabase";
import { getActiveCohort, getEnrollment, getAssessments } from "@/lib/cohort";

const scoreColor = (score: number, max: number) => {
  const pct = (score / max) * 100;
  if (pct >= 90) return "text-emerald-400";
  if (pct >= 70) return "text-amber-300";
  return "text-[#ff6b6b]";
};

export default async function Page() {
  const session = await auth();
  if (!session?.user?.email) return <div className="p-8">Login required</div>;

  // No enrollment in the active cohort → must fill the registration form first
  const cohort = await getActiveCohort();
  const enrollment = cohort
    ? await getEnrollment(session.user.email, cohort.id)
    : null;
  if (!cohort || !enrollment) redirect("/course/register");

  const assessments = await getAssessments(cohort.id);

  const { data: scoreRows } = await vcsDb
    .from("assessment_scores")
    .select("assessment_id, score")
    .eq("enrollment_id", enrollment.id);
  const scores = new Map<string, number | null>(
    (scoreRows ?? []).map((r: any) => [r.assessment_id, r.score])
  );

  const linkClasses =
    "inline-flex items-center gap-2 px-4 py-2 rounded-[3px] text-sm font-semibold border border-[#F86531]/50 text-[#F86531] hover:bg-[#F86531] hover:text-white transition-all duration-200";
  const disabledClasses =
    "inline-flex items-center gap-2 px-4 py-2 rounded-[3px] text-sm font-medium border border-white/[0.08] text-[#94A3B8] cursor-not-allowed opacity-60";

  const actionLabel = (kind: string) =>
    kind === "quiz" ? "Attempt Quiz" : kind === "hackathon" ? "Hackathon Details" : "Submit Assignment";

  return (
    <div className="min-h-screen px-4 pb-14 pt-8 md:px-6 md:pb-20 md:pt-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 space-y-4">
          <p className="scout-eyebrow">Your progress</p>
          <h1 className="scout-heading text-4xl md:text-6xl">
            Course <span className="scout-gradient-text">progress</span>
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#94A3B8]">
            {cohort.name}
          </p>
        </div>

        <div className="space-y-4">
          {assessments.length === 0 && (
            <p className="text-[#94A3B8]">Assessments will appear here soon.</p>
          )}
          {assessments.map((a) => {
            const score = scores.get(a.id);
            const hasScore = score !== null && score !== undefined;
            return (
              <div
                key={a.id}
                className="scout-panel group"
              >
                <div className="flex items-center justify-between p-6 md:p-7 gap-6">
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12 rounded-[2px] border border-[#F86531]/40 bg-[#F86531]/10 flex items-center justify-center">
                      <span className="font-mono text-[#F86531] font-semibold text-base">
                        {a.module ?? "★"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-[#F8FAFC] mb-3">
                        {a.title}
                      </h2>
                      {a.url ? (
                        <a href={a.url} target="_blank" rel="noopener noreferrer" className={linkClasses}>
                          <span>{actionLabel(a.kind)}</span>
                        </a>
                      ) : (
                        <span className={disabledClasses}>{actionLabel(a.kind)} · coming soon</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-center justify-center px-5 py-3 rounded-[2px] border border-white/[0.08] min-w-[96px]">
                    <div className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#94A3B8] mb-2">
                      Score
                    </div>
                    {hasScore ? (
                      <>
                        <div className={`font-mono text-3xl font-semibold ${scoreColor(Number(score), a.max_score)}`}>
                          {Number(score)}
                        </div>
                        <div className="font-mono text-xs text-[#94A3B8] mt-1">/ {a.max_score}</div>
                      </>
                    ) : (
                      <div className="font-mono text-3xl text-white/20">-</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
