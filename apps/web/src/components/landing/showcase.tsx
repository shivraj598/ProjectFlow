import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { gsap, initGsap } from "./motion";
import { FAINT, INK, LINE, LINE_SOFT, MUTED, TEXT } from "./tokens";

const SLIDES = [
  {
    src: "/images/04-board.png",
    alt: "Kanban board with drag-and-drop columns",
    title: "The board",
    desc: "Columns, WIP and inline creation. Move work with a flick, not a meeting.",
    tag: "01",
    stat: "3 cols",
    statLabel: "+ WIP limits",
  },
  {
    src: "/images/09-sprint-detail.png",
    alt: "Sprint detail page with burndown chart",
    title: "The sprint",
    desc: "Goals, members, committed points and a burndown that updates live.",
    tag: "02",
    stat: "14-day",
    statLabel: "burndown",
  },
  {
    src: "/images/03-dashboard.png",
    alt: "Organization analytics dashboard",
    title: "The dashboard",
    desc: "Status, priority, workload and the 14-day trend — one glance, zero export.",
    tag: "03",
    stat: "~0 ms",
    statLabel: "real-time sync",
  },
  {
    src: "/images/07-backlog.png",
    alt: "Project backlog with planned sprints",
    title: "The backlog",
    desc: "Unscheduled work, ready to be pulled into the next cycle the moment it matters.",
    tag: "04",
    stat: "∞",
    statLabel: "unscheduled items",
  },
];

export function LandingShowcase() {
  const root = useRef<HTMLElement>(null);
  const imgWrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const timer = useRef<number | null>(null);

  // entrance
  useEffect(() => {
    initGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".show-head",
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
          }
        );
        gsap.fromTo(
          ".show-frame",
          { y: 60, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power4.out",
            scrollTrigger: { trigger: ".show-frame", start: "top 85%", once: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  // crossfade on tab change
  useEffect(() => {
    if (!imgWrap.current) return;
    gsap.fromTo(
      imgWrap.current,
      { opacity: 0.25, scale: 0.985 },
      { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out", overwrite: "auto" }
    );
  }, [active]);

  // auto-advance, pause on hover
  useEffect(() => {
    const start = () => {
      stop();
      timer.current = window.setInterval(() => {
        setActive((a) => (a + 1) % SLIDES.length);
      }, 5500);
    };
    const stop = () => {
      if (timer.current) window.clearInterval(timer.current);
    };
    start();
    const el = root.current;
    el?.addEventListener("pointerenter", stop);
    el?.addEventListener("pointerleave", start);
    return () => {
      stop();
      el?.removeEventListener("pointerenter", stop);
      el?.removeEventListener("pointerleave", start);
    };
  }, []);

  const s = SLIDES[active];

  return (
    <section ref={root} id="showcase" className="relative overflow-hidden py-16 lg:py-24" style={{ background: INK }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(55% 38% at 50% 0%, rgba(255,255,255,0.05), transparent 65%)" }}
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* header */}
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="show-head mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: FAINT }}>
              <span className="inline-block h-px w-8 bg-white/60" />
              [ 03 — Product tour ]
            </p>
            <h2 className="show-head text-[clamp(1.9rem,3.6vw,3rem)] font-bold leading-[1.04] tracking-[-0.02em]" style={{ color: TEXT }}>
              One workspace,
              <br />
              <span className="inline-block bg-white px-2 text-black">four views.</span>
            </h2>
          </div>
          <p className="show-head max-w-sm text-[14.5px] leading-relaxed" style={{ color: MUTED }}>
            This is the actual product — not mockups. Pick a view, or let it
            play. Everything stays in sync.
          </p>
        </div>

        {/* tab pills */}
        <div className="show-head mb-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product views">
          {SLIDES.map((t, i) => (
            <button
              key={t.tag}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className="flex shrink-0 items-center gap-2.5 rounded-full border px-4 py-2 text-[13px] font-medium transition-all duration-300"
              style={{
                borderColor: i === active ? "#fff" : LINE,
                background: i === active ? "#fff" : "transparent",
                color: i === active ? "#000" : MUTED,
              }}
            >
              <span className="font-mono text-[11px]" style={{ color: i === active ? "#000" : FAINT }}>
                {t.tag}
              </span>
              {t.title}
            </button>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-[340px_1fr]">
          {/* side list */}
          <div className="show-frame grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-1" style={{ borderColor: LINE, background: LINE }}>
            {SLIDES.map((t, i) => {
              const on = i === active;
              return (
                <button
                  key={t.tag}
                  onClick={() => setActive(i)}
                  className="group relative flex flex-col p-5 text-left transition-colors duration-300"
                  style={{ background: on ? "#0d0d0d" : "#050505" }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-[2px] bg-white transition-transform duration-300"
                    style={{ transform: on ? "scaleY(1)" : "scaleY(0)", transformOrigin: "top" }}
                  />
                  <span className="flex items-center justify-between">
                    <span className="font-mono text-[11px] tracking-[0.16em]" style={{ color: on ? TEXT : FAINT }}>
                      {t.tag} — {t.title}
                    </span>
                    <ArrowRight className="size-3.5 transition-all" style={{ color: on ? TEXT : "transparent", transform: on ? "translateX(0)" : "translateX(-6px)" }} />
                  </span>
                  <span className="mt-2 text-[13px] leading-relaxed" style={{ color: on ? TEXT : MUTED }}>
                    {t.desc}
                  </span>
                  <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: FAINT }}>
                    <span className="text-[13px] text-white">{t.stat}</span> {t.statLabel}
                  </span>
                  {/* auto progress */}
                  {on && (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <span key={active} className="show-autobar block h-full w-full origin-left bg-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* main frame */}
          <figure className="show-frame group relative overflow-hidden rounded-2xl border" style={{ borderColor: LINE, background: "#060606" }}>
            <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: LINE_SOFT, background: "#0a0a0a" }}>
              <span className="flex gap-1.5">
                <i className="size-2.5 rounded-full bg-white/20" />
                <i className="size-2.5 rounded-full bg-white/20" />
                <i className="size-2.5 rounded-full bg-white" />
              </span>
              <span className="mx-auto hidden max-w-xs flex-1 truncate rounded-full border px-3 py-1 text-center font-mono text-[10.5px] sm:block" style={{ borderColor: LINE_SOFT, color: FAINT }}>
                projectflow.app / {s.title.replace("The ", "")}
              </span>
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: FAINT }}>
                {s.tag} / 04
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: TEXT }} />
              </span>
            </div>
            <div ref={imgWrap} key={s.src} className="relative">
              <img src={s.src} alt={s.alt} loading="lazy" className="block aspect-[16/10] w-full object-cover object-top" />
              <figcaption
                className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 18%, transparent)" }}
              >
                <div>
                  <p className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: TEXT }}>
                    <span className="font-mono" style={{ color: FAINT }}>{s.tag}</span> {s.title}
                  </p>
                  <p className="mt-1 max-w-md text-[13.5px] leading-snug" style={{ color: MUTED }}>
                    {s.desc}
                  </p>
                </div>
              </figcaption>
            </div>
            {/* dots */}
            <div className="flex items-center justify-between border-t px-4 py-3" style={{ borderColor: LINE_SOFT, background: "#080808" }}>
              <div className="flex gap-1.5">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setActive(i)}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ width: i === active ? 28 : 12, background: i === active ? "#fff" : "rgba(255,255,255,0.18)" }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActive((active - 1 + SLIDES.length) % SLIDES.length)}
                  className="rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors hover:bg-white hover:text-black"
                  style={{ borderColor: LINE, color: TEXT }}
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setActive((active + 1) % SLIDES.length)}
                  className="rounded-full bg-white px-4 py-1.5 text-[12px] font-semibold text-black transition-opacity hover:opacity-90"
                >
                  Next →
                </button>
              </div>
            </div>
          </figure>
        </div>
      </div>

      <style>{`.show-autobar{animation:showfill 5.5s linear forwards}@keyframes showfill{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </section>
  );
}
