import { useEffect, useRef } from "react";
import { ArrowUpRight, CalendarCheck2, Kanban, Layers, Scale } from "lucide-react";
import { gsap, initGsap } from "./motion";
import { FAINT, LINE, LINE_SOFT, MUTED, TEXT } from "./tokens";

const CAPABILITIES = [
  {
    index: "01",
    icon: Kanban,
    kbd: "Board",
    title: "Kanban that moves",
    desc: "Drag cards, set WIP, watch the board rebalance itself in real time.",
    stat: "3",
    statLabel: "cols + WIP",
    tint: "LIVE",
  },
  {
    index: "02",
    icon: CalendarCheck2,
    kbd: "Sprint",
    title: "Sprints & burndown",
    desc: "Commit points, close cycles, keep the line honest daily.",
    stat: "14",
    statLabel: "day trend",
    tint: "ON TRACK",
  },
  {
    index: "03",
    icon: Layers,
    kbd: "Backlog",
    title: "Backlog that breathes",
    desc: "Plan the next cycle without losing the work that is not there yet.",
    stat: "∞",
    statLabel: "unscheduled",
    tint: "READY",
  },
  {
    index: "04",
    icon: Scale,
    kbd: "Insights",
    title: "Analytics, live",
    desc: "Status, priority and workload — one glance, zero export.",
    stat: "0",
    statLabel: "meetings needed",
    tint: "~0 MS",
  },
];

export function LandingCapabilities() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".cap-item",
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: { trigger: ".cap-grid", start: "top 82%", once: true },
          }
        );
        gsap.fromTo(
          ".cap-head",
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: root.current, start: "top 82%", once: true },
          }
        );
        // bar visuals grow
        gsap.fromTo(
          ".cap-vbar",
          { scaleY: 0.15 },
          {
            scaleY: 1,
            duration: 1,
            ease: "power3.out",
            stagger: 0.07,
            transformOrigin: "bottom",
            scrollTrigger: { trigger: ".cap-grid", start: "top 70%", once: true },
          }
        );
        // burndown draw
        gsap.fromTo(
          ".cap-draw",
          { strokeDashoffset: 260 },
          {
            strokeDashoffset: 0,
            duration: 1.6,
            ease: "power2.inOut",
            stagger: 0.15,
            scrollTrigger: { trigger: ".cap-grid", start: "top 70%", once: true },
          }
        );
        // kanban dots pop
        gsap.fromTo(
          ".cap-chip",
          { y: 8, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: { trigger: ".cap-grid", start: "top 70%", once: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="capabilities"
      className="relative border-y"
      style={{ borderColor: LINE, background: "#000000" }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        {/* ---------- header ---------- */}
        <div className="mb-10 flex flex-col gap-8 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p
              className="cap-head mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em]"
              style={{ color: FAINT }}
            >
              <span className="inline-block h-px w-8 bg-white/60" />
              [ 02 — Capabilities ]
              <span
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] tracking-[0.12em]"
                style={{ borderColor: LINE, color: TEXT }}
              >
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                </span>
                LIVE SYSTEM
              </span>
            </p>
            <h2
              className="cap-head text-[clamp(1.9rem,3.6vw,3rem)] font-bold leading-[1.04] tracking-[-0.02em]"
              style={{ color: TEXT }}
            >
              Four primitives,
              <br />
              <span className="inline-block bg-white px-2 text-black">one flow.</span>
            </h2>
          </div>
          <p className="cap-head max-w-sm text-[14.5px] leading-relaxed" style={{ color: MUTED }}>
            No plugins, no exports, no status meetings. Every pixel below is the
            product — hover a card to feel how the work actually moves.
          </p>
        </div>

        {/* ---------- grid ---------- */}
        <div
          className="cap-grid grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-4"
          style={{ borderColor: LINE, background: LINE }}
        >
          {CAPABILITIES.map((c) => (
            <article
              key={c.title}
              className="cap-item group relative flex min-h-[400px] flex-col bg-[#050505] p-6 transition-colors duration-300 hover:bg-[#0a0a0a]"
            >
              {/* top active hairline */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-white transition-transform duration-500 group-hover:scale-x-100"
              />
              {/* hover glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(80% 50% at 50% 0%, rgba(255,255,255,0.07), transparent 70%)",
                }}
              />

              <div className="relative flex items-start justify-between">
                <span className="font-mono text-[11px] tracking-[0.18em]" style={{ color: FAINT }}>
                  {c.index}
                </span>
                <span
                  className="rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.1em]"
                  style={{ borderColor: LINE_SOFT, color: FAINT }}
                >
                  <span className="mr-1.5 text-[13px] text-white">{c.stat}</span>
                  {c.statLabel}
                </span>
              </div>

              <div className="relative mt-5">
                <span
                  className="flex size-10 items-center justify-center rounded-xl border transition-all duration-300 group-hover:bg-white group-hover:text-black"
                  style={{ borderColor: LINE, color: "#fff" }}
                >
                  <c.icon className="size-[18px]" />
                </span>
                <h3
                  className="mt-4 text-[16px] font-semibold tracking-tight"
                  style={{ color: TEXT }}
                >
                  {c.title}
                </h3>
                <p className="mt-1.5 min-h-[60px] text-[13px] leading-relaxed" style={{ color: MUTED }}>
                  {c.desc}
                </p>
              </div>

              {/* ---------- live mini visual ---------- */}
              <div
                className="relative mt-auto overflow-hidden rounded-xl border p-3"
                style={{ borderColor: LINE_SOFT, background: "rgba(255,255,255,0.025)" }}
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: FAINT }}>
                    {c.kbd} · preview
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em]" style={{ color: "#fff" }}>
                    <span className="size-1 animate-pulse rounded-full bg-white" />
                    {c.tint}
                  </span>
                </div>
                {c.index === "01" && <KanbanMini />}
                {c.index === "02" && <BurndownMini />}
                {c.index === "03" && <BacklogMini />}
                {c.index === "04" && <AnalyticsMini />}
              </div>

              {/* ---------- footer ---------- */}
              <div
                className="relative mt-4 flex items-center justify-between border-t pt-3.5"
                style={{ borderColor: LINE_SOFT }}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: FAINT }}>
                  ⌘{c.index} — Open
                </span>
                <span
                  className="flex size-7 items-center justify-center rounded-full border opacity-40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:border-white group-hover:bg-white group-hover:text-black group-hover:opacity-100"
                  style={{ borderColor: LINE }}
                >
                  <ArrowUpRight className="size-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* ---------- bottom meta ---------- */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: FAINT }}>
          <span>Sys.pf — 4 modules · 1 source of truth</span>
          <span className="hidden sm:block">Hover to inspect · Scroll to enter →</span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Mini visuals — pure CSS/SVG, monochrome                             */
/* ------------------------------------------------------------------ */

function KanbanMini() {
  const cols = [
    { name: "Todo", chips: 2, wip: "2/4" },
    { name: "Doing", chips: 3, wip: "3/3" },
    { name: "Done", chips: 1, wip: "1/∞" },
  ];
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {cols.map((col, i) => (
        <div key={col.name} className="rounded-lg bg-white/[0.03] p-1.5">
          <p className="mb-1.5 flex items-center justify-between font-mono text-[8px] uppercase tracking-wider" style={{ color: FAINT }}>
            {col.name}
            <span style={{ color: i === 1 ? "#fff" : FAINT }}>{col.wip}</span>
          </p>
          <div className="space-y-1">
            {Array.from({ length: col.chips }).map((_, j) => (
              <div
                key={j}
                className="cap-chip h-[18px] rounded-[5px] border"
                style={{
                  borderColor: "rgba(255,255,255,0.1)",
                  background: j === 0 && i === 1 ? "#ffffff" : "rgba(255,255,255,0.08)",
                  opacity: j === 0 && i === 1 ? 1 : undefined,
                }}
              />
            ))}
          </div>
          {/* wip bar */}
          <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: i === 1 ? "100%" : i === 0 ? "50%" : "20%", opacity: i === 1 ? 1 : 0.5 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function BurndownMini() {
  return (
    <div className="relative">
      <svg viewBox="0 0 200 72" className="w-full" role="img" aria-label="Burndown trending down">
        <line x1="0" y1="66" x2="200" y2="6" stroke="#fff" strokeOpacity="0.18" strokeDasharray="3 5" strokeWidth="1" />
        {[16, 32, 48].map((y) => (
          <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#fff" strokeOpacity="0.06" strokeWidth="1" />
        ))}
        <polyline
          points="0,62 40,50 80,42 120,28 160,30 188,12"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="260"
          className="cap-draw"
        />
        <circle cx="188" cy="12" r="3.5" fill="#fff" />
        <circle cx="188" cy="12" r="7" fill="none" stroke="#fff" strokeOpacity="0.3" />
        <circle cx="0" cy="62" r="2.5" fill="#666" />
      </svg>
      <div className="mt-1 flex items-center justify-between font-mono text-[8.5px]" style={{ color: FAINT }}>
        <span>-3 pts vs ideal</span>
        <span style={{ color: "#fff" }}>● on track</span>
      </div>
    </div>
  );
}

function BacklogMini() {
  const rows = [
    { dot: "#fff", label: "Auth refresh flow", pts: "5" },
    { dot: "#a3a3a3", label: "Empty states polish", pts: "3" },
    { dot: "#666", label: "Export to CSV", pts: "2" },
  ];
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.label} className="cap-chip flex items-center gap-2 rounded-lg border px-2 py-[7px]" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
          <span className="size-1.5 shrink-0 rounded-full" style={{ background: r.dot }} />
          <span className="min-w-0 flex-1 truncate text-[11px] font-medium" style={{ color: TEXT }}>
            {r.label}
          </span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[8px]" style={{ color: MUTED }}>
            {r.pts} pts
          </span>
        </div>
      ))}
      <p className="pt-0.5 text-center font-mono text-[8.5px] tracking-[0.12em]" style={{ color: FAINT }}>
        + 12 MORE IN QUEUE
      </p>
    </div>
  );
}

function AnalyticsMini() {
  const bars = [38, 62, 45, 80, 56, 92, 70];
  return (
    <div>
      <div className="flex h-[64px] items-end gap-1.5">
        {bars.map((h, i) => (
          <div
            key={i}
            className="cap-vbar flex-1 rounded-[4px]"
            style={{
              height: `${h}%`,
              background: i === 5 ? "#ffffff" : "rgba(255,255,255,0.22)",
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[8.5px]" style={{ color: FAINT }}>
        <span>7D VELOCITY</span>
        <span style={{ color: "#fff" }}>42 PTS ▲ 18%</span>
      </div>
    </div>
  );
}
