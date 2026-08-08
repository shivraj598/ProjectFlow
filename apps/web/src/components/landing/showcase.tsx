import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, initGsap } from "./motion";
import { ACCENT, FAINT, INK, LINE, MUTED, TEXT } from "./tokens";

const SLIDES = [
  {
    src: "/images/04-board.png",
    alt: "Kanban board with drag-and-drop columns",
    title: "The board",
    desc: "Columns, WIP and inline creation. Move work with a flick, not a meeting.",
    tag: "01",
  },
  {
    src: "/images/09-sprint-detail.png",
    alt: "Sprint detail page with burndown chart",
    title: "The sprint",
    desc: "Goals, members, committed points and a burndown that updates live.",
    tag: "02",
  },
  {
    src: "/images/03-dashboard.png",
    alt: "Organization analytics dashboard",
    title: "The dashboard",
    desc: "Status, priority, workload and the 14-day trend — one glance, zero export.",
    tag: "03",
  },
  {
    src: "/images/07-backlog.png",
    alt: "Project backlog with planned sprints",
    title: "The backlog",
    desc: "Unscheduled work, ready to be pulled into the next cycle the moment it matters.",
    tag: "04",
  },
];

export function LandingShowcase() {
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const distance = () => Math.max((track.current?.scrollWidth ?? 0) - window.innerWidth + 48, 0);
        gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top top",
            end: () => "+=" + distance(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        // progress bar under the section
        gsap.fromTo(
          ".show-progress",
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: wrap.current,
              start: "top top",
              end: () => "+=" + distance(),
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    }, wrap);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={wrap} id="showcase" className="relative overflow-hidden" style={{ background: INK }}>
      <div
        ref={track}
        className="flex min-h-[100dvh] w-max items-center gap-8 pr-[6vw] will-change-transform"
      >
        {/* intro panel */}
        <div className="flex w-[82vw] max-w-[560px] shrink-0 flex-col justify-center px-6 sm:px-10">
          <span
            className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em]"
            style={{ color: FAINT, borderColor: LINE }}
          >
            Visual tour
          </span>
          <h2
            className="mt-6 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.02em]"
            style={{ color: TEXT }}
          >
            Four screens,
            <br />
            <span style={{ color: MUTED }}>zero slack between them.</span>
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed" style={{ color: FAINT }}>
            This is the actual product — drag the board, burn the sprint, read the plan. Keep
            scrolling, the gallery moves with you.
          </p>
          <p className="mt-8 flex items-center gap-2 text-[13px] font-medium" style={{ color: ACCENT }}>
            <span className="size-1.5 rounded-full" style={{ background: ACCENT }} /> Scroll — the section pans
          </p>
        </div>

        {/* slide frames */}
        {SLIDES.map((s) => (
          <figure
            key={s.title}
            className="group relative w-[74vw] max-w-[960px] shrink-0 overflow-hidden rounded-2xl border sm:w-[60vw]"
            style={{ borderColor: LINE, background: "#0f131b" }}
          >
            <img
              src={s.src}
              alt={s.alt}
              loading="lazy"
              className="block w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
            <figcaption
              className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6"
              style={{ background: "linear-gradient(to top, rgba(8,10,14,0.92) 20%, transparent)" }}
            >
              <div>
                <p className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: ACCENT }}>
                  <span className="font-mono" style={{ color: FAINT }}>{s.tag}</span> {s.title}
                </p>
                <p className="mt-1.5 max-w-md text-[14px] leading-snug" style={{ color: MUTED }}>
                  {s.desc}
                </p>
              </div>
              <ArrowUpRight className="mb-1 size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: FAINT }} />
            </figcaption>
          </figure>
        ))}
      </div>

      {/* progress rail */}
      <div className="absolute inset-x-6 bottom-6 hidden h-px overflow-hidden sm:block" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="show-progress h-full w-full origin-left" style={{ background: ACCENT }} />
      </div>
    </section>
  );
}