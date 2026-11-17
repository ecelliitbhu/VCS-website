import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserStatus } from "@/lib/signup";
import React from "react";

export default async function Page() {
  const session = await auth();
  if (!session || !session.user)
    return <div className="p-8">Login required</div>;

  // Outdated or missing signup → must (re)fill the registration form first
  if ((await getUserStatus(session.user.email)) !== "registered") {
    redirect("/course/register");
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  // fetch weeks metadata and user's scores
  const [weeksReq, scoresReq] = await Promise.all([
    fetch(base + "/api/course/weeks", { cache: "no-store" }),
    fetch(
      base +
        "/api/course/scores?email=" +
        encodeURIComponent(session.user.email || ""),
      { cache: "no-store" }
    ),
  ]);

  const weeksRes = await weeksReq.json();
  const scoresRes = await scoresReq.json();

  const weeks = weeksRes?.weeks || [];
  const scoresMap = (scoresRes?.scores || []).reduce(
    (acc: any, s: any) => ({ ...acc, [s.week]: s.score }),
    {}
  );

  // FRONTEND-ONLY: duplicate week 4 into a quiz card with week=99
  const uiWeeks = weeks.flatMap((w: any) => {
    if (w.week === 4) {
      return [
        w,
        {
          ...w,
          week: 99, // frontend sentinel for module 4 quiz
          title: `${w.title} – Quiz`,
          isModule4Quiz: true,
        },
      ];
    }
    return [w];
  });

  const getScoreDisplay = (score: any) => {
    if (score === null || score === undefined) {
      return (
        <div className="text-3xl font-bold text-gray-300 dark:text-gray-600">
          -
        </div>
      );
    }

    const numericScore = Number(score);
    let colorClass = "text-red-500 dark:text-red-400";
    let bgGradient = "from-red-500/10 to-red-600/5";

    if (numericScore >= 90) {
      colorClass = "text-green-500 dark:text-green-400";
      bgGradient = "from-green-500/10 to-green-600/5";
    } else if (numericScore >= 70) {
      colorClass = "text-yellow-500 dark:text-yellow-400";
      bgGradient = "from-yellow-500/10 to-yellow-600/5";
    }

    return (
      <div className="relative">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${bgGradient} rounded-2xl blur-xl`}
        ></div>
        <div className={`relative text-3xl font-bold ${colorClass}`}>
          {numericScore}
        </div>
      </div>
    );
  };

  // helper: max score per week (99 = module 4 quiz)
  const getMaxScoreForWeek = (week: number) => {
    if ([2, 4].includes(week)) return 100;
    if ([1, 3, 5, 99].includes(week)) return 10;
    return 10; // default, in case more weeks are added
  };

  const MODULE_2_QUIZ = "https://forms.gle/sgyN5ZHgoWd4WK9K7";
  const MODULE_3_QUIZ = "https://forms.gle/YsEkrcFPcTkyFHdB9";
  const MODULE_4_QUIZ = "https://forms.gle/V6drcFaz8Sa1A456A";
  const MODULE_5_QUIZ = "https://forms.gle/6tNzS4GG1Np5LsXGA";

  const activeQuizClasses =
    "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-200";

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Course <span className="gradient-text">Modules</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Track your progress and access course materials
          </p>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {uiWeeks.map((w: any) => {
            // use 99 only in frontend for quiz score lookup
            const score = scoresMap[w.isModule4Quiz ? 99 : w.week];
            const hasLink = !!w.submission_link;
            const isModuleQuiz = [1, 3, 5].includes(w.week);

            const buttonLabel = isModuleQuiz
              ? "Attempt Quiz"
              : "Submit Assignment";

            const buttonClasses = `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${
              hasLink
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-200"
                : "bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed opacity-60"
            }`;

            // Special UI for original week 4 (module + assignment + quiz link)
            if (w.week === 4 && !w.isModule4Quiz) {
              return (
                <div
                  key={w.week}
                  className="group bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300"
                >
                  <div className="flex items-center justify-between p-6 md:p-7 gap-6">
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <span className="text-white font-bold text-lg">
                          {w.week}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl md:text-2xl font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300">
                          {w.title}
                        </h2>

                        <a
                          href={MODULE_4_QUIZ}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={activeQuizClasses}
                        >
                          <span>Attempt Quiz</span>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </a>

                        <div className="mt-3">
                          <a
                            href="https://forms.gle/mZGY4G7JbYZEHxAg7"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={activeQuizClasses}
                          >
                            <span>Submit Assignment</span>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex flex-col items-center justify-center px-6 py-4 rounded-lg bg-slate-800/60 border border-slate-700/50 min-w-[100px]">
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                        Score
                      </div>
                      {getScoreDisplay(score)}
                      {score !== null && score !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">
                          / {getMaxScoreForWeek(w.week)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            const MODULE_2_OR_3 =
              w.week === 2 ? MODULE_2_QUIZ : w.week === 3 ? MODULE_3_QUIZ : null;

            const MODULE_5_OR_QUIZ = w.week === 5 ? MODULE_5_QUIZ : null;

            return (
              <div
                key={w.week}
                className="group bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300"
              >
                <div className="flex items-center justify-between p-6 md:p-7 gap-6">
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <span className="text-white font-bold text-lg">
                        {w.isModule4Quiz ? 4 : w.week}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl md:text-2xl font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300">
                        {w.title}
                      </h2>

                      <div className="flex items-center gap-4 flex-wrap">
                        {w.isModule4Quiz ? (
                          // frontend-only quiz card for module 4
                          <a
                            href={MODULE_4_QUIZ}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={activeQuizClasses}
                          >
                            <span>Module 4 Quiz</span>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </a>
                        ) : MODULE_2_OR_3 ? (
                          <a
                            href={MODULE_2_OR_3}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={activeQuizClasses}
                          >
                            <span>
                              {w.week === 2
                                ? "Submit Assignment"
                                : "Attempt Quiz"}
                            </span>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </a>
                        ) : MODULE_5_OR_QUIZ ? (
                          <a
                            href={MODULE_5_OR_QUIZ}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={activeQuizClasses}
                          >
                            <span>Attempt Quiz</span>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </a>
                        ) : (
                          <div className="inline-flex items-center gap-3">
                            {hasLink ? (
                              <a
                                href={w.submission_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={buttonClasses}
                              >
                                <span>{buttonLabel}</span>
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </a>
                            ) : (
                              <button disabled className={buttonClasses}>
                                <span>{buttonLabel}</span>
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-center justify-center px-6 py-4 rounded-lg bg-slate-800/60 border border-slate-700/50 min-w-[100px]">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      Score
                    </div>
                    {getScoreDisplay(score)}
                    {score !== null && score !== undefined && (
                      <div className="text-xs text-gray-500 mt-1">
                        / {getMaxScoreForWeek(w.isModule4Quiz ? 99 : w.week)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hackathon Card */}
        <div className="mt-6 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 p-6 md:p-7">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/20">
              🏆
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white mb-1">
                Hackathon
              </h3>
              <p className="text-gray-400 mb-3">Final Assessment</p>
              <a
                href="https://forms.gle/FCPRTu7C9h7CgswE9"
                target="_blank"
                rel="noopener noreferrer"
                className={activeQuizClasses}
              >
                <span>Submit Hackathon</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
