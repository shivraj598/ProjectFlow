import { useEffect, useRef } from "react";
import { CalendarCheck2, GanttChartSquare, Layout, Scale } from "lucide-react";
import { gsap, initGsap } from "./motion";
import { FAINT, LINE, MUTED, TEXT } from "./tokens";

const CAPABILITIES = [
  {
    icon: GanttChartSquare,
    title: "Kanban that moves",
    desc: "Drag cards, set WIP, watch the board rebalance itself in real time.",
    stat: "3",
    statLabel: "columns + WIP",
  },
  {
    icon: CalendarCheck2,
    title: "Sprints & burndown",
    desc: "Commit points, close cycles, keep the line honest daily.",
    stat: "14",
    statLabel: "day trend",
  },
  {
    icon: Layout,
    title: "Backlog that breathes",
    desc: "Plan the next cycle without losing the work that is not there yet.",
    stat: "∞",
    statLabel: "unscheduled items",
  },
  {
    icon: Scale,
    title: "Analytics, live",
    desc: "Status, priority and workload — one glance, zero export.",
    stat: "0",
    statLabel: "meetings required",
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
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.09,
            scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative border-y" style={{ borderColor: LINE, background: "#000000" }}>
      <div className="mx-auto grid w-full max-w-6xl gap-px px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4" style={{ background: LINE }}>
        {CAPABILITIES.map((c) => (
          <div key={c.title} className="cap-item group relative bg-[#030303] p-7 transition-colors duration-300">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "radial-gradient(70% 60% at 50% 0%, rgba(255,255,255,0.05), transparent 70%)" }}
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg border" style={{ borderColor: LINE, color: "#ffffff" }}>
                  <c.icon className="size-4" />
                </span>
                <span className="font-mono text-[11px]" style={{ color: FAINT }}>
                  <span className="text-[15px] text-white">{c.stat}</span> {c.statLabel}
                </span>
              </div>
              <p className="mt-4 text-[15px] font-semibold tracking-tight" style={{ color: TEXT }}>
                {c.title}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: MUTED }}>
                {c.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}