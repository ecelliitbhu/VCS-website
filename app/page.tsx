import Image from "next/image";
import { auth } from "@/auth";
import { getUserStatus } from "@/lib/signup";
import HomeClient from "./HomeClient";

const partners = [
  {
    id: 1,
    name: "247 VC",
    logo: "247vclogo.png",
  },
  {
    id: 2,
    name: "BVC",
    logo: "BVClogo.png",
  },
];

const courseRoadmap = [
  {
    module: "01",
    title: "Foundations & Fund Economics",
    days: [
      { day: 1, topic: "Introduction to Venture Capitalism" },
      { day: 2, topic: "Working and Structure of a VC Firm" },
      { day: 3, topic: "VC Fund Economics: Basic and Advanced Tracks" },
    ],
  },
  {
    module: "02",
    title: "Startup Ecosystem & Due Diligence",
    days: [
      { day: 4, topic: "Understanding the Startup Ecosystem & Market Analysis" },
      { day: 5, topic: "Due Diligence Procedures & KPIs" },
    ],
  },
  {
    module: "03",
    title: "Deal Structuring & Investment Memo",
    days: [
      { day: 7, topic: "Deal Types and Valuation" },
      { day: 8, topic: "Term Sheets and Cap Table Lab" },
      { day: 9, topic: "Investment Memo Clinic and Assignment Briefing" },
    ],
  },
  {
    module: "04",
    title: "Pitches, Portfolio & Emerging Trends",
    days: [
      { day: 12, topic: "Pitch Evaluation, Portfolio Management and Risk" },
      { day: 13, topic: "VC in India and Abroad" },
      { day: 14, topic: "Future of VC and Careers" },
    ],
  },
];

const reasons = [
  "Learn from real VC investors",
  "Master deal flow & due diligence",
  "Build a strong VC-ready profile",
];

export default async function Home() {
  const session = await auth();
  const status = await getUserStatus(session?.user?.email);

  // asymmetric bento: alternate wide / narrow cells on the 12-col grid
  const spans = ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"];

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative">
        <div className="mx-auto grid max-w-6xl items-start gap-14 px-4 pb-16 pt-8 md:px-6 md:pb-24 md:pt-12 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-8">
            <p className="scout-pill scout-rise scout-rise-1">
              <span className="scout-live" />
              Pre-event
              <span className="text-white/25">&bull;</span>
              E-Summit
            </p>

            <h1 className="scout-heading scout-rise scout-rise-2 text-[3rem] sm:text-6xl lg:text-[4.4rem]">
              Empowering
              <br />
              <span className="scout-gradient-text">Venture Capitalists</span>
              <br />
              of Tomorrow
            </h1>

            <p className="scout-rise scout-rise-3 max-w-xl text-lg leading-relaxed text-[#94A3B8]">
              VC Scout 2026 is a practical programme covering deal flow, due
              diligence and term sheets, taught by practising investors.
            </p>

            <div className="scout-rise scout-rise-4">
              <HomeClient status={status} />
            </div>
          </div>

          {/* Why list: open layout, no box */}
          <aside className="scout-rise scout-rise-3 lg:pt-24">
            <div className="mb-5 flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#94A3B8]">
              <span>Why VC Scout</span>
              <span>VCS/26</span>
            </div>
            <ul className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
              {reasons.map((reason, i) => (
                <li key={reason} className="flex items-baseline gap-4 py-4">
                  <span className="font-mono text-xs tabular-nums text-[#F86531]">0{i + 1}</span>
                  <span className="text-[#F8FAFC]">{reason}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {/* Metrics strip */}
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <dl className="grid grid-cols-3 border-y border-white/[0.08]">
            {[
              ["04", "Modules"],
              ["11", "Lesson days"],
              ["01", "Final hackathon"],
            ].map(([n, label], i) => (
              <div
                key={label}
                className={`px-2 py-6 sm:px-6 ${i > 0 ? "border-l border-white/[0.08]" : ""}`}
              >
                <dt className="font-display text-4xl font-extrabold tracking-tight text-[#F8FAFC] sm:text-5xl">{n}</dt>
                <dd className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#94A3B8] sm:text-[0.68rem]">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Roadmap */}
      <section
        aria-labelledby="course-roadmap-heading"
        className="mx-auto w-full max-w-6xl px-4 pb-8 pt-20 md:px-6 md:pt-24"
      >
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-4">
            <p className="scout-eyebrow">The learning path</p>
            <h2 id="course-roadmap-heading" className="scout-heading text-4xl sm:text-5xl">
              Course roadmap
            </h2>
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#94A3B8]">
            11 lesson days <span className="px-1 text-[#F86531]">/</span> 4 modules
          </p>
        </div>

        <ol className="grid gap-4 md:grid-cols-12">
          {courseRoadmap.map((module, idx) => (
            <li key={module.module} className={`scout-panel p-6 sm:p-8 ${spans[idx]}`}>
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-3 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[#F86531]">
                    Stage {module.module}
                    <span className="px-2 text-white/25">/</span>
                    <span className="text-[#94A3B8]">
                      {module.days.length} {module.days.length === 1 ? "day" : "days"}
                    </span>
                  </p>
                  <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-[#F8FAFC] sm:text-2xl">
                    {module.title}
                  </h3>
                </div>
                <span className="scout-numeral text-6xl sm:text-7xl" aria-hidden="true">{module.module}</span>
              </div>

              <ol className="border-t border-white/[0.08]">
                {module.days.map((lesson) => (
                  <li
                    key={lesson.day}
                    className="flex gap-4 border-b border-white/[0.06] py-3 last:border-b-0"
                  >
                    <span className="w-9 shrink-0 font-mono text-xs font-medium tabular-nums text-[#F86531]">
                      D{String(lesson.day).padStart(2, "0")}
                    </span>
                    <span className="text-sm leading-relaxed text-[#CBD5E1]">{lesson.topic}</span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </section>

      {/* Partners */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-24 pt-20 md:px-6 md:pt-28">
        <div className="grid items-center gap-8 border-t border-white/[0.08] pt-12 md:grid-cols-[1fr_2fr]">
          <div className="space-y-3">
            <p className="scout-eyebrow">Partners</p>
            <h2 className="scout-heading text-3xl sm:text-4xl">Our partners</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {partners.map((partner) => (
              <div key={partner.id} className="scout-panel group flex items-center gap-5 p-4">
                <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-[2px] bg-[#F8FAFC] px-3 py-2">
                  <Image
                    src={`/${partner.logo}`}
                    alt={`${partner.name} logo`}
                    width={180}
                    height={76}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#94A3B8]">Partner</p>
                  <h3 className="font-display mt-1 text-xl font-bold text-[#F8FAFC]">{partner.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
