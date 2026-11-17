import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MdArrowOutward } from "react-icons/md";
import { auth } from "@/auth";
import { getUserStatus } from "@/lib/signup";
import HomeClient from "./HomeClient";

// const courses = [
//   {
//     id: 1,
//     title: "Venture Capital 101",
//     short: "Learn the fundamentals of VC.",
//     duration: "8 Weeks",
//   },
//   {
//     id: 2,
//     title: "Startup Idea Validation",
//     short: "How to know if your idea is a winner.",
//     duration: "4 Weeks",
//   },
//   {
//     id: 3,
//     title: "Growth Hacking Basics",
//     short: "Scale your startup fast.",
//     duration: "6 Weeks",
//   },
// ];

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

export default async function Home() {
  const session = await auth();
  const status = await getUserStatus(session?.user?.email);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="min-h-[45vh] relative pt-10">
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-8">
          {/* Main Hero Content */}
          <section className="grid items-start gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                <span className="h-px w-8 bg-[#F86531]" />
                E-Summit '27
                <span className="text-white/50">·</span>
                Dawn of the Defiant
              </p>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="block text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl font-extrabold text-white leading-[1.08] tracking-tight">
                  Empowering
                </span>
                <span className="block text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl font-extrabold text-white leading-[1.08] tracking-tight">
                  Venture Capitalists
                </span>
                <span className="block text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl font-extrabold text-white leading-[1.08] tracking-tight">
                  of Tomorrow
                </span>
              </h1>
              <p className="text-white/85 text-lg leading-relaxed max-w-md drop-shadow-sm">
                VC Scout develops future VC talent with practical training and
                real deal-flow exposure for career-ready investing skills.
              </p>

                <HomeClient status={status} />
            </div>

            <div>
              <Card className="rounded-2xl border border-orange-100/20 bg-gradient-to-br from-[#713f32]/75 via-[#573641]/70 to-[#29364a]/78 p-6 shadow-[0_12px_40px_rgba(36,20,22,0.25)] backdrop-blur-xl md:p-8">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg md:text-xl font-bold">
                    Why VC Scout?
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-[#F86531] font-bold text-lg">•</span>
                      <span>Learn from real VC investors</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F86531] font-bold text-lg">•</span>
                      <span>Master deal flow &amp; due diligence</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F86531] font-bold text-lg">•</span>
                      <span>Build a strong VC-ready profile</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

        </div>
      </section>

      <section
        aria-labelledby="course-roadmap-heading"
        className="mx-auto w-full max-w-6xl px-4 pt-10 pb-6 md:px-6 md:pt-16 md:pb-8"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">
              The learning path
            </p>
            <h2
              id="course-roadmap-heading"
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Built in four stages.
            </h2>
          </div>
          <p className="text-sm text-white/70">11 lesson days <span className="px-1 text-orange-300">/</span> 4 modules</p>
        </div>

        <ol className="grid gap-5 md:grid-cols-2">
          {courseRoadmap.map((module) => (
            <li
              key={module.module}
              className="relative overflow-hidden rounded-2xl border border-orange-100/25 bg-gradient-to-br from-[#713f32]/80 via-[#573641]/78 to-[#29364a]/82 p-5 shadow-[0_16px_40px_rgba(36,20,22,0.28)] backdrop-blur-xl sm:p-6"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-orange-300/80 via-rose-300/45 to-transparent" />
              <div className="mb-4 flex items-start gap-4">
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-orange-200/25 bg-orange-300/10 px-2 font-mono text-xs font-semibold tracking-wider text-orange-100">
                  {module.module}
                </span>
                <div>
                  <h3 className="text-lg font-semibold leading-snug text-white sm:text-xl">
                    {module.title}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/45">
                    {module.days.length} lesson {module.days.length === 1 ? "day" : "days"}
                  </p>
                </div>
              </div>

              <ol className="ml-1 border-l border-white/10">
                {module.days.map((lesson) => (
                  <li
                    key={lesson.day}
                    className="relative flex gap-3 py-2.5 pl-4 first:pt-1 last:pb-0"
                  >
                    <span className="absolute -left-[3px] top-[1.05rem] h-1.5 w-1.5 rounded-full bg-[#F86531]" />
                    <span className="w-10 shrink-0 text-xs font-semibold tabular-nums text-orange-200/80">
                      D{lesson.day}
                    </span>
                    <span className="text-sm leading-relaxed text-white/80">
                      {lesson.topic}
                    </span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </section>

      {/* Partners Section */}
      <section className="mx-auto max-w-6xl px-4 pt-2 pb-24 md:px-6 md:pt-4 md:pb-28">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-white/20 pb-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">
              In good company
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Our Partners
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {partners.map((partner) => (
            <Card
              key={partner.id}
              className="group flex min-h-36 items-center gap-5 rounded-2xl border-white/20 bg-[#10283d]/60 p-5 shadow-[0_16px_40px_rgba(7,18,31,0.2)] backdrop-blur-xl transition-colors hover:border-orange-200/40 hover:bg-[#10283d]/75 sm:gap-7 sm:p-6"
            >
              <CardContent className="flex w-full items-center gap-5 p-0 sm:gap-7">
                <div className="flex h-20 w-36 shrink-0 items-center justify-center rounded-xl border border-orange-100/60 bg-[#ead3b7] px-4 py-3 shadow-inner shadow-[#713f32]/10 sm:h-24 sm:w-44 sm:px-5">
                  <Image
                    src={`/${partner.logo}`}
                    alt={`${partner.name} logo`}
                    width={180}
                    height={76}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/80">
                    E-Summit &apos;27
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                    {partner.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-300/80">Our partner</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
