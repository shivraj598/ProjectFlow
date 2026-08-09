import { useEffect, useRef } from "react";
import { Activity, BarChart3, CalendarClock, MessageSquare, Zap } from "lucide-react";
import { gsap, initGsap } from "./motion";
import { FAINT, LINE, LINE_SOFT, MUTED, PANEL, PANEL_2, TEXT } from "./tokens";

export function LandingBento() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".bento-cell",
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
          }
        );
        gsap.fromTo(
          ".workload-bar",
          { width: 0 },
          {
            width: (i: number) => `${[90, 70, 50, 30][i]}%`,
            duration: 1.2,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: ".workload-track", start: "top 88%", once: true },
          }
        );
        gsap.fromTo(
          ".draw-line",
          { strokeDashoffset: 320 },
          {
            strokeDashoffset: 0,
            duration: 1.6,
            ease: "power2.inOut",
            scrollTrigger: { trigger: ".burndown-box", start: "top 85%", once: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="features" className="relative py-24 lg:py-32" style={{ background: "#000000" }}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-14 max-w-2xl">
          <h2 className="text-[clamp(1.9rem,3.4vw,3rem)] font-bold leading-[1.05] tracking-[-0.02em]" style={{ color: TEXT }}>
            The whole lifecycle,
            <br />
            <span className="inline-block bg-white px-2 text-black">one surface.</span>
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed" style={{ color: FAINT }}>
            Kanban, sprints, backlogs, comments and analytics — designed to feel like one
            product, not a patchwork.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-6">
          {/* A — board preview (4 cols) */}
          <div
            className="bento-cell relative overflow-hidden rounded-2xl border p-5 md:col-span-4 md:p-6"
            style={{ borderColor: LINE, background: PANEL }}
          >
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full blur-3xl" style={{ background: "rgba(255,255,255,0.04)" }} />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-md text-[9px] font-bold" style={{ background: "#ffffff", color: "#000000" }}>
                  WEB
                </span>
                <span className="text-[13px] font-semibold" style={{ color: TEXT }}>
                  Website Redesign
                </span>
              </div>
              <span
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
                style={{ borderColor: LINE_SOFT, color: "#ffffff" }}
              >
                <span className="size-1.5 rounded-full bg-white" /> Active
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              {COLS.map((col) => (
                <div key={col.name} className="flex-1 rounded-xl p-2" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${LINE_SOFT}` }}>
                  <div className="mb-2 flex items-center gap-1.5 px-1">
                    <span className="size-1.5 rounded-full" style={{ background: col.dot }} />
                    <span className="text-[10px] font-semibold" style={{ color: FAINT }}>
                      {col.name}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {col.tasks.map((t) => (
                      <div key={t.title} className="rounded-lg border px-2 py-1.5" style={{ borderColor: LINE_SOFT, background: PANEL_2 }}>
                        <p className="truncate text-[11px] font-medium" style={{ color: TEXT }}>
                          {t.title}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="rounded px-1 py-0.5 font-mono text-[8px] font-medium uppercase" style={{ color: "#a3a3a3", background: "rgba(255,255,255,0.08)" }}>
                            {t.tag}
                          </span>
                          <span className="flex size-4 items-center justify-center rounded-full text-[7.5px] font-bold" style={{ background: "#d4d4d4", color: "#000000" }}>
                            {t.avatar}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B — burndown (2 cols) */}
          <div
            className="bento-cell burndown-box relative overflow-hidden rounded-2xl border p-5 md:col-span-2 md:p-6"
            style={{ borderColor: LINE, background: "rgba(255,255,255,0.04)" }}
          >
            <div className="relative flex items-center justify-between">
              <span className="flex size-8 items-center justify-center rounded-lg border" style={{ borderColor: LINE_SOFT, color: "#ffffff" }}>
                <BarChart3 className="size-4" />
              </span>
              <span className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium" style={{ borderColor: LINE_SOFT, color: "#a3a3a3" }}>
                <CalendarClock className="size-3" /> Burndown
              </span>
            </div>
            <p className="relative mt-4 text-[15px] font-semibold leading-snug" style={{ color: TEXT }}>
              Sprints that
              <br />
              measure themselves.
            </p>
            <div className="relative -mx-2">
              <BurndownChart />
            </div>
          </div>

          {/* C — live activity (2 cols) */}
          <div
            className="bento-cell flex flex-col rounded-2xl border p-5 md:col-span-2 md:p-6"
            style={{ borderColor: LINE, background: PANEL }}
          >
            <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: TEXT }}>
              <Activity className="size-4" style={{ color: "#ffffff" }} /> Live activity
              <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium" style={{ color: FAINT }}>
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 bg-white" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                </span>
                connected
              </span>
            </div>
            <div className="mt-5 space-y-3.5">
              {ACTIVITY.map((a) => (
                <div key={a.text} className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold" style={{ background: "#e8e8e8", color: "#000000" }}>
                    {a.initials}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-[12.5px]" style={{ color: a.important ? TEXT : MUTED }}>
                    {a.text}
                  </p>
                  <span className="text-[10px]" style={{ color: FAINT }}>
                    {a.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* D — workload (2 cols) */}
          <div
            className="bento-cell flex flex-col rounded-2xl border p-5 md:col-span-2 md:p-6"
            style={{ borderColor: LINE, background: PANEL }}
          >
            <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: TEXT }}>
              <Zap className="size-4" style={{ color: "#ffffff" }} /> Workload
            </div>
            <div className="workload-track mt-5 flex flex-1 flex-col justify-center gap-4">
              {WORKLOAD.map((w, i) => (
                <div key={w.name} className="flex items-center gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold" style={{ background: "#e8e8e8", color: "#000000" }}>
                    {w.initials}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="workload-bar h-full rounded-full bg-white" style={{ opacity: i % 2 === 0 ? 1 : 0.6 }} />
                  </div>
                  <span className="w-6 text-right font-mono text-[11px]" style={{ color: FAINT }}>
                    {w.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* E — words (2 cols) */}
          <div
            className="bento-cell relative flex flex-col justify-center overflow-hidden rounded-2xl border p-5 md:col-span-2 md:p-6"
            style={{ borderColor: LINE, background: "#0a0a0a" }}
          >
            <div className="relative">
              <MessageSquare className="size-4" style={{ color: "#ffffff" }} />
              <p className="mt-3 text-[17px] font-semibold leading-snug tracking-tight" style={{ color: TEXT }}>
                Every decision leaves a trail.
              </p>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: MUTED }}>
                Comments, mentions and a full activity timeline on every task — join the
                conversation where the work lives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const COLS = [
  {
    name: "Backlog",
    dot: "#808080",
    tasks: [
      { title: "Review onboarding copy", tag: "medium", avatar: "AC" },
      { title: "Finalize sprint scope", tag: "bug", avatar: "MO" },
    ],
  },
  {
    name: "In progress",
    dot: "#ffffff",
    tasks: [
      { title: "Dark mode flicker fix", tag: "urgent", avatar: "LM" },
      { title: "Mobile notifications", tag: "3 pts", avatar: "IR" },
    ],
  },
  {
    name: "Done",
    dot: "#ffffff",
    tasks: [
      { title: "Setup analytics events", tag: "done", avatar: "RP" },
    ],
  },
];

const ACTIVITY = [
  { initials: "AC", text: "Ava moved TASK-104 to In Review", time: "now", important: true },
  { initials: "MO", text: "Maya closed Sprint 4 · 42 items", time: "2m", important: false },
  { initials: "LM", text: "Leo assigned TASK-118 to Ines", time: "9m", important: false },
];

const WORKLOAD = [
  { name: "Ava", initials: "AC", count: 9 },
  { name: "Maya", initials: "MO", count: 7 },
  { name: "Leo", initials: "LM", count: 5 },
  { name: "Ines", initials: "IR", count: 3 },
];

function BurndownChart() {
  const ideal = "0,104 40,84 80,64 120,44 160,24 200,4";
  const actual = "0,96 36,74 72,58 110,38 148,40 178,18";
  return (
    <svg viewBox="0 0 200 110" className="mt-3 w-full" role="img" aria-label="Sprint burndown trending on track">
      <line x1="0" y1="104" x2="200" y2="4" stroke="#808080" strokeOpacity="0.3" strokeDasharray="3 5" />
      <polyline points={ideal} fill="none" stroke="#808080" strokeOpacity="0.4" strokeWidth="1.5" />
      <polyline points={actual} fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="320" className="draw-line" />
      <circle cx="178" cy="18" r="3.5" fill="#ffffff" />
      <circle cx="0" cy="104" r="3" fill="#808080" fillOpacity="0.5" />
    </svg>
  );
}