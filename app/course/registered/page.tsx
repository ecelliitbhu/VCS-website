import { auth } from "@/auth";
import { headers } from "next/headers";
import React from "react";

export default async function Page() {
  const session = await auth();
  if (!session || !session.user)
    return <div className="p-8">Login required</div>;

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
          {weeks.map((w: any) => {
            const score = scoresMap[w.week];
            const isModuleTwo = w.week === 2; // Identify Module 2

            // Base checks for the standard assignment/quiz button
            const hasLink = !!w.submission_link;
            const isModuleOneOrThreeOrFive = [1, 3, 5].includes(w.week);

            const buttonLabel = isModuleOneOrThreeOrFive
              ? "Attempt Quiz"
              : "Submit Assignment";

            const disabled = !hasLink;

            const buttonClasses = `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${hasLink
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-200"
                : "bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed opacity-60"
              }`;

            return (
              <div
                key={w.week}
                className="group bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300"
              >
                <div className="flex items-center justify-between p-6 md:p-7 gap-6">
                  {/* Left: Module info */}
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    {/* Module number */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <span className="text-white font-bold text-lg">
                        {w.week}
                      </span>
                    </div>

                    {/* Title and links */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl md:text-2xl font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300">
                        {w.title}
                      </h2>
                      <div className="flex items-center gap-4 flex-wrap">

                        {/* 🚀 START: Custom Logic for Module 2 */}
                        {isModuleTwo ? (
                          <div className="flex items-center gap-3">
                            {/* Problem Statement Button (Orange) */}
                            <a
                              href="https://drive.google.com/file/d/1qYizWOJ02DKDYAFDlzAfA1Rcg7W2LFnR/view?usp=sharing"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-500/40 transition-all duration-200"
                            >
                              <span>Problem Statement</span>
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
                            
                            {/* Submit Assignment Button (Blue - uses standard submission link) */}
                            <a
                              href={w.submission_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-200"
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

                        ) : (
                          /* * 🚀 END: Custom Logic for Module 2 
                           * START: Standard Logic for all other Modules (1, 3, 4, 5...) 
                           */
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

                            {/* Coming Soon Badge: shown only when link is missing and it's not a quiz module */}
                            {!hasLink && !isModuleOneOrThreeOrFive && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-400 border border-orange-500/30 animate-pulse">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Coming Soon
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Score */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center px-6 py-4 rounded-lg bg-slate-800/60 border border-slate-700/50 min-w-[100px]">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      Score
                    </div>
                    {getScoreDisplay(score)}
                    {score !== null && score !== undefined && (
                      <div className="text-xs text-gray-500 mt-1">/ 100</div>
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
              <p className="text-gray-400">Final Assessment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}