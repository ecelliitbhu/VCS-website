"use client";

import { useState, useEffect } from "react";
import {
  isDayUnlocked,
  unlockLabel,
  moduleFirstDay,
  parseDayNumber,
} from "@/data/course-schedule";
import { withSubmitButtons } from "@/data/assignment-links";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Lightbulb,
  Lock,
  Trophy,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import RegisterButton from "./components/register-button";
// 💡 Import metadata and types
import { modules, courseModules, ModuleDetail } from "@/data/course-data";

// --- Types ---

type Status = "no-session" | "unregistered" | "registered";

interface CourseClientProps {
  status: Status;
  isAdmin?: boolean;
}

const moduleContentLoaders: Record<number, () => Promise<ModuleDetail[]>> = {
  1: async () => (await import("@/data/modules/module1-content")).module1Content,
  2: async () => (await import("@/data/modules/module2-content")).module2Content,
  3: async () => (await import("@/data/modules/module3-content")).module3Content,
  4: async () => (await import("@/data/modules/module4-content")).module4Content,
};

const moduleContentCache = new Map<number, Promise<ModuleDetail[]>>();

const loadModuleContent = (moduleNumber: number) => {
  const cached = moduleContentCache.get(moduleNumber);
  if (cached) return cached;

  const loader = moduleContentLoaders[moduleNumber];
  if (!loader) {
    return Promise.reject(new Error(`Unknown module number: ${moduleNumber}`));
  }

  const content = loader().catch((error: unknown) => {
    moduleContentCache.delete(moduleNumber);
    throw error;
  });
  moduleContentCache.set(moduleNumber, content);
  return content;
};

const prefetchModuleContent = (moduleNumber: number) => {
  void loadModuleContent(moduleNumber).catch((error: unknown) => {
    console.error(`Failed to preload content for Module ${moduleNumber}:`, error);
  });
};

// --- Module Detail Page Component (Dynamically loads content) ---

interface ModuleDetailPageProps {
  moduleNumber: number;
  onBack: () => void;
  now: number;
  isAdmin: boolean;
}

const ModuleDetailPage: React.FC<ModuleDetailPageProps> = ({
  moduleNumber,
  onBack,
  now,
  isAdmin,
}) => {
  const [curriculum, setCurriculum] = useState<ModuleDetail[] | null>(null);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [showContext, setShowContext] = useState(false);
  const moduleInfo = courseModules.find((m) => m.module === moduleNumber);

  useEffect(() => {
    setCurriculum(null);
    let active = true;

    loadModuleContent(moduleNumber)
      .then((content) => {
        if (active) setCurriculum(content);
      })
      .catch((error: unknown) => {
        console.error(
          `Failed to load content for Module ${moduleNumber}:`,
          error
        );
        if (active) setCurriculum([]);
      });

    return () => {
      active = false;
    };
  }, [moduleNumber]);

  // Reading progress bar: progress through the lesson (day) being read, not the whole module
  useEffect(() => {
    const onScroll = () => {
      setShowContext(window.scrollY > 260);
      const articles = Array.from(
        document.querySelectorAll<HTMLElement>("[data-lesson-day]")
      );
      if (!articles.length) {
        setProgress(0);
        return;
      }
      const line = window.innerHeight * 0.3; // reading line
      const current =
        [...articles].reverse().find((a) => a.getBoundingClientRect().top <= line) ??
        articles[0];
      const rect = current.getBoundingClientRect();
      const done = (line - rect.top) / Math.max(1, rect.height - window.innerHeight * 0.4);
      setProgress(Math.min(1, Math.max(0, done)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [curriculum]);

  // Highlight the lesson currently being read
  useEffect(() => {
    if (!curriculum?.length) return;
    const articles = Array.from(
      document.querySelectorAll<HTMLElement>("[data-lesson-day]")
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveDay(Number(entry.target.getAttribute("data-lesson-day")));
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    articles.forEach((a) => observer.observe(a));
    return () => observer.disconnect();
  }, [curriculum]);

  const goToDay = (dayNum: number) => {
    document.getElementById(`day-${dayNum}`)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  if (!moduleInfo) {
    return (
      <div className="mx-auto min-h-screen max-w-6xl px-4 pb-16 pt-8 text-center md:px-6">
        <h2 className="font-display text-4xl font-bold text-[#F8FAFC]">Module not found</h2>
        <Button onClick={onBack} variant="outline" className="mt-8">
          <ArrowLeft /> Back to course
        </Button>
      </div>
    );
  }

  const lessons = curriculum ?? [];
  const currentLesson =
    lessons.find((d) => parseDayNumber(d.day) === activeDay) ?? lessons[0] ?? null;

  // The module-level assignment box (not the per-day ones) inside the lessons
  const assignmentLesson = lessons.find((d) => d.detail.includes("data-module-assignment"));
  const assignmentUnlocked = assignmentLesson
    ? isDayUnlocked(parseDayNumber(assignmentLesson.day), now, isAdmin)
    : false;
  const goToAssignment = () => {
    document.querySelector("[data-module-assignment]")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Context bar: which module and day you're in, plus progress through the day */}
      <div
        className={`fixed inset-x-0 top-[76px] z-40 border-b border-white/[0.08] bg-[#091522]/85 backdrop-blur-md transition-all duration-200 ${
          showContext ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
        aria-hidden={!showContext}
      >
        <div className="mx-auto flex h-11 max-w-6xl items-center gap-3 px-4 md:px-6">
          <span className="shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#F86531]">
            Module {String(moduleInfo.module).padStart(2, "0")}
          </span>
          <span className="hidden shrink-0 text-white/25 sm:inline">/</span>
          <span className="hidden min-w-0 truncate text-sm text-[#94A3B8] sm:inline">
            {moduleInfo.title}
          </span>
          {currentLesson && (
            <>
              <span className="shrink-0 text-white/25">/</span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#F8FAFC]">
                <span className="mr-2 font-mono text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[#ff8a5c]">
                  {currentLesson.day}
                </span>
                {currentLesson.content}
              </span>
            </>
          )}
        </div>
        <div className="h-[2px] w-full bg-white/[0.04]">
          <div
            className="h-full origin-left bg-[#F86531]"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-x-14 px-4 pb-24 pt-6 md:px-6 md:pt-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Sidebar: back + lesson index (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-36 space-y-8">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft /> Back to course
            </Button>

            <div>
              <p className="mb-4 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-[#F86531]">
                Module {String(moduleInfo.module).padStart(2, "0")}
              </p>
              <ol className="space-y-1 border-l border-white/[0.08]">
                {lessons.map((day) => {
                  const n = parseDayNumber(day.day);
                  const unlocked = isDayUnlocked(n, now, isAdmin);
                  const current = activeDay === n;
                  return (
                    <li key={day.day}>
                      <button
                        type="button"
                        disabled={!unlocked}
                        onClick={() => goToDay(n)}
                        className={`-ml-px flex w-full items-start gap-3 border-l-2 py-2 pl-4 pr-2 text-left text-sm transition-colors disabled:cursor-not-allowed ${
                          current
                            ? "border-[#F86531] text-[#F8FAFC]"
                            : "border-transparent text-[#94A3B8] hover:text-[#F8FAFC]"
                        }`}
                      >
                        <span className="mt-0.5 shrink-0 font-mono text-[0.68rem] tabular-nums text-[#F86531]">
                          D{String(n).padStart(2, "0")}
                        </span>
                        <span className="leading-snug">
                          {day.content}
                          {!unlocked && <Lock className="ml-2 inline h-3 w-3" />}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              {assignmentLesson && (
                <button
                  type="button"
                  disabled={!assignmentUnlocked}
                  onClick={goToAssignment}
                  className="mt-5 flex w-full items-center gap-3 border border-[#F86531]/50 bg-[#F86531]/10 px-4 py-3 text-left transition-colors hover:bg-[#F86531]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#ff8a5c]">
                      Module {String(moduleInfo.module).padStart(2, "0")}
                    </span>
                    <span className="mt-0.5 block font-display text-sm font-bold text-[#F8FAFC]">
                      Module assignment
                    </span>
                  </span>
                  {assignmentUnlocked ? (
                    <ArrowDown className="h-4 w-4 shrink-0 text-[#F86531]" />
                  ) : (
                    <Lock className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                  )}
                </button>
              )}
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          {/* Mobile: back + day pills */}
          <div className="mb-8 space-y-4 lg:hidden">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft /> Back to course
            </Button>
            {lessons.length > 0 && (
              <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4">
                {lessons.map((day) => {
                  const n = parseDayNumber(day.day);
                  const unlocked = isDayUnlocked(n, now, isAdmin);
                  return (
                    <button
                      key={day.day}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => goToDay(n)}
                      className={`shrink-0 rounded-[2px] border px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] disabled:opacity-50 ${
                        activeDay === n
                          ? "border-[#F86531] text-[#F86531]"
                          : "border-white/[0.12] text-[#94A3B8]"
                      }`}
                    >
                      {day.day}
                    </button>
                  );
                })}
                {assignmentLesson && (
                  <button
                    type="button"
                    disabled={!assignmentUnlocked}
                    onClick={goToAssignment}
                    className="shrink-0 rounded-[2px] border border-[#F86531] bg-[#F86531]/10 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[#ff8a5c] disabled:opacity-50"
                  >
                    Assignment
                  </button>
                )}
              </div>
            )}
          </div>

          <header className="mb-16 space-y-5 border-b border-white/[0.08] pb-10">
            <p className="scout-eyebrow">
              Module {String(moduleInfo.module).padStart(2, "0")}
              <span className="text-white/25">/</span>
              <span className="text-[#94A3B8]">{moduleInfo.dayRange}</span>
            </p>
            <h1 className="scout-heading text-4xl sm:text-5xl">
              {moduleInfo.title}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-[#94A3B8] sm:text-lg">
              {moduleInfo.description}
            </p>
            <ul className="flex flex-wrap gap-2 pt-2" aria-label="Key topics">
              {moduleInfo.topics.map((topic) => (
                <li key={topic} className="scout-chip">
                  {topic}
                </li>
              ))}
            </ul>
          </header>

          {/* Lessons */}
          <div aria-busy={!curriculum}>
            {!curriculum ? (
              <div className="space-y-5" role="status" aria-live="polite">
                <div className="h-4 w-24 animate-pulse rounded-[2px] bg-white/10" />
                <div className="h-9 max-w-md animate-pulse rounded-[2px] bg-white/10" />
                <div className="h-4 max-w-2xl animate-pulse rounded-[2px] bg-white/10" />
                <div className="h-4 max-w-xl animate-pulse rounded-[2px] bg-white/10" />
                <span className="sr-only">Loading Module {moduleNumber} lessons...</span>
              </div>
            ) : (
              lessons.map((day: ModuleDetail, index) => {
                const n = parseDayNumber(day.day);
                const unlocked = isDayUnlocked(n, now, isAdmin);
                const next = lessons[index + 1];
                const nextN = next ? parseDayNumber(next.day) : null;
                return (
                  <article
                    key={day.day}
                    id={`day-${n}`}
                    data-lesson-day={n}
                    className={`scroll-mt-36 ${index > 0 ? "mt-24 border-t border-white/[0.08] pt-16" : ""}`}
                  >
                    <p className="mb-4 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#F86531]">
                      {day.day}
                      <span className="px-2 text-white/25">/</span>
                      <span className="text-[#94A3B8]">
                        Lesson {index + 1} of {lessons.length}
                      </span>
                    </p>
                    <h2 className="mb-10 max-w-3xl font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-[#F8FAFC] sm:text-4xl">
                      {day.content}
                    </h2>

                    {unlocked ? (
                      <div dangerouslySetInnerHTML={{ __html: withSubmitButtons(day.detail, moduleNumber) }} />
                    ) : (
                      <div className="flex items-center gap-4 border border-white/[0.08] p-6">
                        <Lock className="h-5 w-5 text-[#94A3B8]" />
                        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#94A3B8]">
                          {unlockLabel(n)}
                        </p>
                      </div>
                    )}

                    {unlocked && next && nextN !== null && isDayUnlocked(nextN, now, isAdmin) && (
                      <button
                        type="button"
                        onClick={() => goToDay(nextN)}
                        className="group mt-16 block w-full max-w-[68ch] rounded-[2px] bg-[linear-gradient(135deg,#F86531,#C42F35_55%,#13324F)] p-px text-left shadow-[0_0_44px_rgba(248,101,49,0.22)] transition-shadow duration-300 hover:shadow-[0_0_64px_rgba(248,101,49,0.4)]"
                      >
                        <span className="flex items-center justify-between gap-5 bg-[#0B1B2E] bg-[radial-gradient(120%_160%_at_0%_0%,rgba(248,101,49,0.25),transparent_60%)] px-6 py-6 sm:px-8 sm:py-7">
                          <span className="min-w-0">
                            <span className="block font-mono text-[0.7rem] uppercase tracking-[0.22em] text-[#ff8a5c]">
                              Up next &middot; {next.day}
                            </span>
                            <span className="mt-2 block font-display text-2xl font-extrabold leading-tight tracking-tight text-[#F8FAFC] sm:text-3xl">
                              {next.content}
                            </span>
                            <span className="mt-3 block font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#94A3B8]">
                              Continue to the next lesson
                            </span>
                          </span>
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] bg-[#F86531] text-white transition-transform duration-200 group-hover:translate-y-1">
                            <ArrowDown className="h-5 w-5" />
                          </span>
                        </span>
                      </button>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Course Client Component ---

const CourseClient: React.FC<CourseClientProps> = ({ status, isAdmin = false }) => {
  const [activeModule, setActiveModule] = useState<number | null>(null);

  // Re-evaluate unlocks every minute so a module opens without a page refresh.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const moduleDay = (moduleNumber: number) => {
    const info = courseModules.find((m) => m.module === moduleNumber);
    return info ? moduleFirstDay(info.dayRange) : 1;
  };
  const moduleUnlocked = (moduleNumber: number) =>
    isDayUnlocked(moduleDay(moduleNumber), now, isAdmin);

  const scrollToCourseStructure = () => {
    document
      .getElementById("course-structure")
      ?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
  };

  const handleModuleClick = (moduleNumber: number) => {
    if (status === "no-session") {
      window.location.href = "/auth";
      return;
    }

    if (status === "unregistered") {
      window.location.href = "/course/register";
      return;
    }

    // Locked until its first lesson day
    if (!moduleUnlocked(moduleNumber)) return;

    // Only registered users can view modules
    prefetchModuleContent(moduleNumber);
    setActiveModule(moduleNumber);
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const handleBackClick = () => {
    setActiveModule(null);
    window.scrollTo({ top: 0 });
  };

  // 1. Module Detail Page View
  if (activeModule !== null) {
    return (
      <ModuleDetailPage
        moduleNumber={activeModule}
        onBack={handleBackClick}
        now={now}
        isAdmin={isAdmin}
      />
    );
  }

  // 2. Main Course Structure View
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-12 pt-8 md:px-6 md:pt-12 lg:grid-cols-[1.1fr_1fr]">
        {/* Left: Hero Text */}
        <div className="relative z-10 space-y-7">
          <p className="scout-pill scout-rise scout-rise-1">
            <span className="scout-live" />
            VC Scout 2026
            <span className="text-white/25">&bull;</span>
            Curriculum
          </p>

          <h1 className="scout-heading scout-rise scout-rise-2 text-5xl sm:text-6xl lg:text-[4.4rem]">
            A practical course
            <br />
            in <span className="scout-gradient-text">venture capital.</span>
          </h1>

          <p className="scout-rise scout-rise-3 max-w-xl text-base leading-relaxed text-[#94A3B8] sm:text-lg">
            Four modules covering how venture capital works, how to evaluate
            startups, and how to make investment decisions.
          </p>

          <div className="scout-rise scout-rise-3 flex flex-wrap gap-2">
            <span className="scout-chip"><BookOpen className="h-3.5 w-3.5 text-[#F86531]" />4 modules</span>
            <span className="scout-chip"><Lightbulb className="h-3.5 w-3.5 text-[#F86531]" />Hands-on casework</span>
            <span className="scout-chip"><Trophy className="h-3.5 w-3.5 text-[#F86531]" />Final hackathon</span>
          </div>

          <div className="scout-rise scout-rise-4 flex flex-wrap gap-3 pt-1">
            <Button type="button" size="lg" variant="outline" onClick={scrollToCourseStructure} className="group">
              Explore the curriculum
              <ArrowDown className="transition-transform group-hover:translate-y-0.5" />
            </Button>
            <RegisterButton status={status} />

            {status === "registered" && (
              <a
                href="https://chat.whatsapp.com/Fs0mgKCDPwYKsgSH9bLlIE?mode=gi_t"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-7 text-sm font-semibold text-[#06281a] shadow-[0_0_28px_rgba(37,211,102,0.3)] transition-all duration-200 hover:bg-[#3ee27a] hover:shadow-[0_0_36px_rgba(37,211,102,0.5)] active:scale-[0.97]"
              >
                <FaWhatsapp className="h-5 w-5" />
                Join WhatsApp group
              </a>
            )}
          </div>
        </div>

        {/* Right: module index (clickable) */}
        <ol className="scout-rise scout-rise-3 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {modules.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                disabled={!moduleUnlocked(item.module)}
                className="group flex w-full items-center gap-5 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F86531] disabled:cursor-not-allowed disabled:opacity-60"
                onMouseEnter={() => moduleUnlocked(item.module) && prefetchModuleContent(item.module)}
                onFocus={() => moduleUnlocked(item.module) && prefetchModuleContent(item.module)}
                onClick={() => handleModuleClick(item.module)}
              >
                <span className="font-mono text-xs tabular-nums text-[#F86531]">
                  {String(item.module).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-bold leading-snug tracking-tight text-[#F8FAFC] transition-colors group-hover:text-[#F86531]">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-[#94A3B8]">
                    {moduleUnlocked(item.module)
                      ? item.topic
                      : unlockLabel(moduleDay(item.module))}
                  </span>
                </span>
                {moduleUnlocked(item.module) ? (
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#94A3B8] transition group-hover:translate-x-1 group-hover:text-[#F86531]" />
                ) : (
                  <Lock className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                )}
              </button>
            </li>
          ))}
          <li className="border-b-0 pt-5">
            <div className="rounded-[2px] bg-[linear-gradient(135deg,#F86531,#C42F35_55%,#13324F)] p-px shadow-[0_0_40px_rgba(248,101,49,0.18)]">
              <div className="flex items-center gap-5 bg-[#0B1B2E] px-5 py-5 bg-[radial-gradient(120%_140%_at_0%_0%,rgba(248,101,49,0.22),transparent_60%)]">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] bg-[#F86531] text-white">
                  <Trophy className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[#ff8a5c]">Capstone</span>
                  <span className="mt-1 block font-display text-xl font-extrabold tracking-tight text-[#F8FAFC]">Final hackathon</span>
                  <span className="mt-0.5 block text-sm text-[#94A3B8]">Put your VC skills to work</span>
                </span>
              </div>
            </div>
          </li>
        </ol>
      </section>

      {/* Course Outline Section */}
      <section
        id="course-structure"
        className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-16 md:px-6 md:py-24"
      >
        <div className="mb-12 max-w-3xl space-y-4">
          <p className="scout-eyebrow">The learning path</p>
          <h2 className="scout-heading text-4xl sm:text-5xl">
            Course curriculum
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-[#94A3B8] sm:text-lg">
            A practical path through VC fundamentals, startup diligence, deal
            structuring and portfolio thinking.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-12">
          {courseModules.map((module, idx) => (
            <Card
              key={module.module}
              id={`module-${module.module}`}
              className={`group scroll-mt-28 p-0 ${idx % 4 === 0 || idx % 4 === 3 ? "md:col-span-7" : "md:col-span-5"}`}
            >
              <button
                type="button"
                className="flex h-full w-full flex-col p-6 text-left disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F86531] sm:p-8"
                aria-label={`Open Module ${module.module}: ${module.title}`}
                disabled={!moduleUnlocked(module.module)}
                onMouseEnter={() => moduleUnlocked(module.module) && prefetchModuleContent(module.module)}
                onFocus={() => moduleUnlocked(module.module) && prefetchModuleContent(module.module)}
                onClick={() => handleModuleClick(module.module)}
              >
                <div className="mb-8 flex w-full items-center justify-between gap-3 font-mono text-[0.68rem] uppercase tracking-[0.2em]">
                  <span className="text-[#F86531]">
                    Module {String(module.module).padStart(2, "0")}
                    <span className="px-2 text-white/25">/</span>
                    <span className="text-[#94A3B8]">{module.dayRange}</span>
                  </span>
                  {moduleUnlocked(module.module) ? (
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#94A3B8] transition group-hover:translate-x-1 group-hover:text-[#F86531]" />
                  ) : (
                    <Lock className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                  )}
                </div>

                <h3 className="mb-3 font-display text-2xl font-bold leading-tight tracking-tight text-[#F8FAFC] sm:text-3xl">
                  {module.title}
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-[#94A3B8] sm:text-base">
                  {module.description}
                </p>

                <div className="mb-6 flex flex-wrap gap-2">
                  {module.topics.slice(0, 4).map((topic) => (
                    <span key={topic} className="scout-chip">{topic}</span>
                  ))}
                  {module.topics.length > 4 && (
                    <span className="scout-chip border-[#F86531]/30 text-[#ff8a5c]">
                      +{module.topics.length - 4} more
                    </span>
                  )}
                </div>

                <div className="mt-auto flex w-full items-center justify-between border-t border-white/[0.08] pt-4 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#94A3B8]">
                  <span className="inline-flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-[#F86531]" />
                    {module.lessonCount} lesson days
                  </span>
                  {moduleUnlocked(module.module) ? (
                    <span className="transition-colors group-hover:text-[#F86531]">Open module</span>
                  ) : (
                    <span className="text-[#ff8a5c]">{unlockLabel(moduleDay(module.module))}</span>
                  )}
                </div>
              </button>
            </Card>
          ))}

          {/* Hackathon: the one place the signature gradient frames a card */}
          <div className="rounded-[2px] bg-[linear-gradient(135deg,#F86531,#C42F35_50%,#13324F)] p-px md:col-span-12">
            <div className="flex flex-col gap-4 bg-[#0B1B2E] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#F86531]">Capstone</p>
                <h3 className="font-display text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">Final hackathon</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#94A3B8] sm:text-base">
                  Bring your learning together in a final assessment grounded in venture capital.
                </p>
              </div>
              <Trophy className="hidden h-10 w-10 shrink-0 text-[#F86531] sm:block" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseClient;
