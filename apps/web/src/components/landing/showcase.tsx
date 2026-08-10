import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, initGsap } from "./motion";
import { FAINT, INK, LINE, MUTED, TEXT } from "./tokens";

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
    <section ref={wrap} id="showcase" className="relative overflow-hidden py-16 md:py-0" style={{ background: INK }}>
      <div
        ref={track}
        className="flex w-full flex-col gap-8 will-change-transform md:w-max md:flex-row md:items-center md:min-h-[100dvh]"
      >
        {/* intro panel */}
        <div className="flex w-full flex-col justify-center px-6 sm:px-10 md:w-[38vw] md:max-w-[560px] md:shrink-0">
          <h2
            className="text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.02] tracking-[-0.02em]"
            style={{ color: TEXT }}
          >
            Four screens,
            <br />
            <span className="inline-block bg-white px-2 text-black">zero slack between them.</span>
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed" style={{ color: FAINT }}>
            This is the actual product — drag the board, burn the sprint, read the plan. Keep
            scrolling, the gallery moves with you.
          </p>
          <p className="mt-8 flex items-center gap-2 text-[13px] font-medium" style={{ color: TEXT }}>
            <span className="size-1.5 rounded-full bg-white" /> Scroll — the section pans
          </p>
        </div>

        {/* slide frames */}
        {SLIDES.map((s) => (
          <figure
            key={s.title}
            className="group relative w-full overflow-hidden rounded-2xl border md:w-[60vw] md:max-w-[960px] md:shrink-0"
            style={{ borderColor: LINE, background: "#060606" }}
          >
            <img
              src={s.src}
              alt={s.alt}
              loading="lazy"
              className="block w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
            <figcaption
              className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6"
              style={{ background: "linear-gradient(to top, rgba(10,13,18,0.94) 20%, transparent)" }}
            >
              <div>
                <p className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: TEXT }}>
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
      <div className="absolute inset-x-6 bottom-6 hidden h-px overflow-hidden rounded-full sm:block" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="show-progress h-full w-full origin-left bg-white" />
      </div>
    </section>
  );
}