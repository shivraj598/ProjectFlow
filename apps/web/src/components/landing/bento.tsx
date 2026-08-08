import { useEffect, useRef } from "react";
import { Activity, BarChart3, CalendarClock, MessageSquare, Zap } from "lucide-react";
import { gsap, initGsap } from "./motion";
import { ACCENT, ACCENT_SOFT, FAINT, LINE, MUTED, TEXT } from "./tokens";

export function LandingBento() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".bento-cell",
          { y: 44, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.09,
            scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="features" className="relative py-28" style={{ background: "#0c0f15" }}>
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <h2
            className="max-w-2xl text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.04] tracking-[-0.02em]"
            style={{ color: TEXT }}
          >
            The whole lifecycle,
            <br />
            <span style={{ color: MUTED }}>one surface.</span>
          </h2>
          <p className="max-w-sm text-[15px] leading-relaxed lg:text-right" style={{ color: FAINT }}>
            Kanban, sprints, backlogs, comments and analytics — designed to feel like one
            product, not a patchwork.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-6 lg:auto-rows-[252px]">
          {/* A — board preview (4 cols) */}
          <div
            className="bento-cell relative overflow-hidden rounded-2xl border p-6 lg:col-span-4"
            style={{ borderColor: LINE, background: "#11151d" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex size-6 items-center justify-center rounded-md font-mono text-[9px] font-bold text-white"
                  style={{ background: "#3ddc97" }}
                >
                  WEB
                </span>
                <span className="text-[13px] font-semibold" style={{ color: TEXT }}>
                  Website Redesign
                </span>
              </div>
              <span
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ color: "#3ddc97", background: "rgba(61,220,151,0.12)" }}
              >
                <span className="size-1.5 rounded-full" style={{ background: "#3ddc97" }} /> Active
              </span>
            </div>
            <div className="mt-4 flex gap-2.5">
              {COLS.map((col) => (
                <div key={col.name} className="flex-1 rounded-xl p-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="mb-2 flex items-center gap-1.5 px-1">
                    <span className="size-1.5 rounded-full" style={{ background: col.dot }} />
                    <span className="text-[10px] font-semibold" style={{ color: FAINT }}>
                      {col.name}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {col.tasks.map((t) => (
                      <div
                        key={t.title}
                        className="rounded-lg border px-2 py-1.5"
                        style={{ borderColor: LINE, background: "rgba(20,25,33,0.9)" }}
                      >
                        <p className="truncate text-[11px] font-medium" style={{ color: TEXT }}>
                          {t.title}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span
                            className="rounded px-1 py-0.5 font-mono text-[8px] font-medium uppercase"
                            style={{ color: t.metaColor, background: `${t.metaColor}22` }}
                          >
                            {t.tag}
                          </span>
                          <span
                            className="flex size-4 items-center justify-center rounded-full text-[8px] font-bold text-white"
                            style={{ background: t.avatarColor }}
                          >
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
            className="bento-cell relative overflow-hidden rounded-2xl border p-6 lg:col-span-2"
            style={{ borderColor: ACCENT_SOFT, background: "rgba(107,157,255,0.07)" }}
          >
            <div className="flex items-center justify-between">
              <span
                className="flex size-8 items-center justify-center rounded-lg"
                style={{ background: ACCENT_SOFT, color: ACCENT }}
              >
                <BarChart3 className="size-4" />
              </span>
              <span
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ color: "rgb(107,157,255)", background: "rgba(107,157,255,0.14)" }}
              >
                <CalendarClock className="size-3" /> Burndown
              </span>
            </div>
            <p className="mt-4 text-[15px] font-semibold leading-snug" style={{ color: TEXT }}>
              Sprints that
              <br />
              measure themselves.
            </p>
            <BurndownChart />
          </div>

          {/* C — live activity (2 cols) */}
          <div
            className="bento-cell flex flex-col rounded-2xl border p-6 lg:col-span-2"
            style={{ borderColor: LINE, background: "#10141b" }}
          >
            <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: TEXT }}>
              <Activity className="size-4" style={{ color: "#3ddc97" }} /> Live activity
              <span className="ml-auto flex items-center gap-1 text-[11px] font-medium" style={{ color: FAINT }}>
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: "#3ddc97" }} />
                  <span className="relative inline-flex size-1.5 rounded-full" style={{ background: "#3ddc97" }} />
                </span>
                connected
              </span>
            </div>
            <div className="mt-5 space-y-3.5">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ background: a.color }}
                  >
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
            className="bento-cell flex flex-col rounded-2xl border p-6 lg:col-span-2"
            style={{ borderColor: LINE, background: "rgba(255,255,255,0.02)" }}
          >
            <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: TEXT }}>
              <Zap className="size-4" style={{ color: ACCENT }} /> Workload
            </div>
            <div className="mt-5 flex flex-1 flex-col justify-center gap-3.5">
              {WORKLOAD.map((w, i) => (
                <div key={w.name} className="flex items-center gap-3">
                  <span className="flex w-8 items-center gap-1.5">
                    <span
                      className="flex size-5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                      style={{ background: w.color }}
                    >
                      {w.initials}
                    </span>
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${w.pct}%`, background: i % 2 === 0 ? ACCENT : "#3ddc97", opacity: 0.85 }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[11px]" style={{ color: FAINT }}>
                    {w.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* E — words (2 cols) */}
          <div
            className="bento-cell flex flex-col justify-center rounded-2xl border p-6 lg:col-span-2"
            style={{ borderColor: LINE, background: ACCENT_SOFT }}
          >
            <MessageSquare className="size-4" style={{ color: ACCENT }} />
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
    </section>
  );
}

const COLS = [
  {
    name: "Backlog",
    dot: "#8b98a8",
    tasks: [
      { title: "Review onboarding copy", tag: "medium", metaColor: "#f5a623", avatar: "AC", avatarColor: "#6b9dff" },
      { title: "Finalize sprint scope", tag: "bug", metaColor: "#f56a6a", avatar: "MO", avatarColor: "#3ddc97" },
    ],
  },
  {
    name: "In progress",
    dot: ACCENT,
    tasks: [
      { title: "Dark mode flicker fix", tag: "urgent", metaColor: "#f56a6a", avatar: "LM", avatarColor: "#f5a623" },
      { title: "Mobile notifications", tag: "3 pts", metaColor: MUTED, avatar: "IR", avatarColor: "#c084fc" },
    ],
  },
  {
    name: "Done",
    dot: "#3ddc97",
    tasks: [
      { title: "Setup analytics events", tag: "done", metaColor: "#3ddc97", avatar: "RP", avatarColor: "#38bdf8" },
    ],
  },
];

const ACTIVITY = [
  { initials: "AC", color: ACCENT, text: "Ava moved TASK-104 to In Review", time: "now", important: true },
  { initials: "MO", color: "#3ddc97", text: "Maya closed Sprint 4 · 42 items", time: "2m", important: false },
  { initials: "LM", color: "#f5a623", text: "Leo assigned TASK-118 to Ines", time: "9m", important: false },
];

const WORKLOAD = [
  { name: "Ava", initials: "AC", color: ACCENT, count: 9, pct: 90 },
  { name: "Maya", initials: "MO", color: "#3ddc97", count: 7, pct: 70 },
  { name: "Leo", initials: "LM", color: "#f5a623", count: 5, pct: 50 },
  { name: "Ines", initials: "IR", color: "#c084fc", count: 3, pct: 30 },
];

function BurndownChart() {
  const ideal = "0,104 40,84 80,64 120,44 160,24 200,4";
  const actual = "0,96 36,74 72,58 110,38 148,40 178,18";
  return (
    <svg viewBox="0 0 200 110" className="mt-5 w-full" role="img" aria-label="Sprint burndown trending on track">
      <line x1="0" y1="104" x2="200" y2="4" stroke={MUTED} strokeOpacity="0.35" strokeDasharray="3 5" />
      <polyline points={ideal} fill="none" stroke={MUTED} strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="1 0" />
      <polyline points={actual} fill="none" stroke="#3ddc97" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="178" cy="18" r="3.5" fill="#3ddc97" />
      <circle cx="0" cy="104" r="3" fill={MUTED} fillOpacity="0.5" />
    </svg>
  );
}