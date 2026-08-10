import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { gsap, initGsap } from "./motion";
import { FAINT, INK, LINE, LINE_SOFT, MUTED, PANEL, PANEL_2, TEXT } from "./tokens";

/* ------------------------------------------------------------------ */
/* Hero — editorial "system sheet": overlay type, ghost wordmark,     */
/* 3D board with registration marks, floating readouts.               */
/* ------------------------------------------------------------------ */

export function LandingHero() {
  const root = useRef<HTMLElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initGsap();
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(".hero-word", { yPercent: 118, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.1 })
        .fromTo(".hero-kicker", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.6")
        .fromTo(".hero-cta", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, "-=0.4")
        .fromTo(
          ".hero-board",
          { y: 60, opacity: 0, rotateX: 14, rotateY: -10, transformOrigin: "50% 60%" },
          { y: 0, opacity: 1, rotateX: 0, rotateY: 0, duration: 1.2, ease: "power4.out" },
          "-=0.55"
        )
        .fromTo(".hero-float", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.55, stagger: 0.13 }, "-=0.6")
        .fromTo(".hero-rail", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.09 }, "-=0.5");

      // perpetual float on readouts
      gsap.to(".hero-float", {
        y: -9,
        duration: 2.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.6, yoyo: true },
      });

      // ghost wordmark drifts against scroll
      gsap.fromTo(
        ".hero-ghost",
        { xPercent: -6 },
        {
          xPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 1 },
        }
      );

      // whole module parallax + readouts at their own speeds
      gsap.to(".hero-board", {
        yPercent: -7,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".float-chip-a", {
        y: -46,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".float-chip-b", {
        y: -20,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });

      // mouse-reactive 3D tilt on the board (desktop only)
      if (window.matchMedia("(pointer: fine)").matches) {
        const xTo = gsap.quickTo(tiltRef.current, "rotationY", { duration: 0.6, ease: "power3.out" });
        const yTo = gsap.quickTo(tiltRef.current, "rotationX", { duration: 0.6, ease: "power3.out" });
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          xTo(-nx * 7);
          yTo(ny * 5);
        };
        window.addEventListener("pointermove", onMove);
        return () => window.removeEventListener("pointermove", onMove);
      }
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="top" className="relative overflow-hidden" style={{ background: INK }}>
      {/* faint white radiance, top corners only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 40% at 82% 4%, rgba(255,255,255,0.05), transparent 60%), radial-gradient(45% 34% at 8% 16%, rgba(255,255,255,0.035), transparent 60%)",
        }}
      />
      {/* blueprint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(92% 78% at 46% 30%, black 6%, transparent 74%)",
          WebkitMaskImage: "radial-gradient(92% 78% at 46% 30%, black 6%, transparent 74%)",
        }}
      />

      {/* ghost wordmark */}
      <div
        aria-hidden
        className="hero-ghost pointer-events-none absolute -right-[4vw] top-[14%] select-none text-[22vw] font-extrabold leading-none tracking-[-0.05em] opacity-[0.045] will-change-transform"
        style={{ WebkitTextStroke: "1px #fff", color: "transparent", whiteSpace: "nowrap" }}
      >
        FLOW
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-0 pt-32 sm:px-6 lg:pt-40">
        <div className="grid w-full gap-12 lg:grid-cols-[0.96fr_1.04fr] lg:items-center lg:gap-8">
          {/* ---------------- copy ---------------- */}
          <div className="relative z-10">
            {/* kicker */}
            <div className="hero-kicker mb-8 flex items-center gap-4">
              <span className="flex items-center gap-2.5 rounded-full border px-3.5 py-1.5" style={{ borderColor: LINE, background: "rgba(255,255,255,0.02)" }}>
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 bg-white" />
                  <span className="relative inline-flex size-2 rounded-full bg-white" />
                </span>
                <span className="text-[12px] font-medium" style={{ color: MUTED }}>
                  Real-time project workspace
                </span>
              </span>
              <span className="hidden font-mono text-[11px] tracking-[0.14em] sm:block" style={{ color: FAINT }}>
                [ SYS / PF-01 ]
              </span>
            </div>

            {/* headline */}
            <h1 className="text-[clamp(3.2rem,8.6vw,6.8rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.045em]" style={{ color: TEXT }}>
              <span className="block overflow-hidden pb-1">
                <span className="hero-word block will-change-transform">Work</span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span className="hero-word block will-change-transform">that</span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span
                  className="hero-word block will-change-transform uppercase"
                  style={{ color: "transparent", WebkitTextStroke: "2px #ffffff" }}
                >
                  moves
                </span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span className="hero-word inline-block uppercase" style={{ background: "#ffffff", color: "#000000", padding: "0 0.14em 0.04em" }}>
                  itself.
                </span>
              </span>
            </h1>

            {/* sub */}
            <p className="mt-7 max-w-[46ch] text-[16px] leading-relaxed" style={{ color: MUTED }}>
              Boards, sprints and analytics that update in real time — watch a task drag
              itself to done, then build your own in minutes.
            </p>

            {/* CTAs */}
            <div className="hero-cta mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "#ffffff", color: "#000000" }}
              >
                Start free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#showcase"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-full border px-7 py-3.5 text-[14px] font-semibold transition-colors hover:bg-white/10"
                style={{ borderColor: LINE, color: TEXT }}
              >
                Explore demo
              </a>
            </div>
          </div>

          {/* ---------------- board ---------------- */}
          <div className="relative [perspective:1600px]">
            {/* readout chips */}
            <FloatChip
              className="float-chip-a hero-float absolute -left-2 top-10 z-10 hidden md:block lg:-left-12"
              chip={
                <Chip
                  title="Sprint 4 · burndown"
                  value="On track"
                  icon={<Sparkles className="size-3.5" />}
                  fine="-3 pts vs ideal"
                />
              }
            />
            <FloatChip
              className="float-chip-b hero-float absolute -right-2 top-24 z-10 hidden md:block lg:-right-12"
              chip={
                <Chip title="TASK-104" value="Moved to Done" icon={<Check className="size-3.5" />} fine="Just now · Ava" accent />
              }
            />

            <div className="relative" style={{ transformStyle: "preserve-3d" }}>
              {/* registration marks */}
              <Mark className="-left-3.5 -top-3.5" />
              <Mark className="-right-3.5 -top-3.5" />
              <Mark className="-bottom-3.5 -left-3.5" />
              <Mark className="-bottom-3.5 -right-3.5" />

              <div ref={tiltRef} className="hero-board will-change-transform" style={{ transformStyle: "preserve-3d" }}>
                <LiveBoard />
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- bottom data strip ---------------- */}
        <div className="hero-rail relative z-10 mt-16 grid grid-cols-2 gap-px border-t sm:grid-cols-3" style={{ borderColor: LINE, background: LINE }}>
          <StripCell label="System status" value="Online · 14/42 pts" live />
          <StripCell label="Delta (real-time)" value="~0 ms" hideOnMobile />
          <StripCell label="Next sprint" value="Sprint 5 · In 3 days" scroll />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function StripCell({ label, value, live, scroll, hideOnMobile }: { label: string; value: string; live?: boolean; scroll?: boolean; hideOnMobile?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 px-1 py-3 sm:px-2 ${hideOnMobile ? "hidden sm:flex" : ""}`} style={{ background: INK }}>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: FAINT }}>
        {label}
      </span>
      <span className="flex items-center gap-2 text-[12px] font-medium" style={{ color: TEXT }}>
        {live && <span className="size-1.5 animate-pulse rounded-full bg-white" />}
        {value}
        {scroll && (
          <span className="hidden items-center gap-1.5 pl-2 font-mono text-[10px] uppercase tracking-[0.16em] sm:flex" style={{ color: FAINT }}>
            <span className="inline-block h-3 w-px animate-pulse bg-white" />
            Scroll
          </span>
        )}
      </span>
    </div>
  );
}

function Mark({ className }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute z-20 size-3.5 opacity-70 ${className ?? ""}`}>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/70" />
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-white/70" />
    </div>
  );
}

function FloatChip({ className, chip }: { className?: string; chip: React.ReactNode }) {
  return (
    <div className={`pointer-events-none select-none ${className ?? ""}`} aria-hidden>
      {chip}
    </div>
  );
}

function Chip({
  title,
  value,
  icon,
  fine,
  accent,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  fine?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 shadow-[0_16px_50px_rgba(0,0,0,0.6)] backdrop-blur-md"
      style={{ borderColor: accent ? "#ffffff" : LINE, background: "rgba(8,8,8,0.9)" }}
    >
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-lg"
        style={{ background: accent ? "#ffffff" : "rgba(255,255,255,0.08)", color: accent ? "#000000" : "#ffffff" }}
      >
        {icon}
      </span>
      <div className="text-left">
        <p className="text-[11px] font-semibold" style={{ color: "#ffffff" }}>
          {title}
        </p>
        <p className="flex items-center gap-1.5 text-[10.5px]" style={{ color: accent ? "#ffffff" : MUTED }}>
          <span className="size-1 rounded-full bg-white" />
          {value}
          {fine && <span style={{ color: FAINT }}>· {fine}</span>}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Live kanban — the board itself                                      */
/* ------------------------------------------------------------------ */

const COLUMNS = [
  { name: "Backlog", dots: [{ label: "Review onboarding copy", tag: "med" }, { label: "Finalize sprint scope", tag: "3pts" }] },
  { name: "In progress", dots: [{ label: "Dark mode flicker fix", tag: "urgent" }] },
  { name: "Done", dots: [{ label: "Setup analytics events", tag: "done" }] },
];

function LiveBoard() {
  const panel = useRef<HTMLDivElement>(null);
  const chip = useRef<HTMLDivElement>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    initGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const slot = (i: number) => {
          const col = colRefs.current[i];
          if (!col || !panel.current) return { x: 0, y: 0 };
          const r = col.getBoundingClientRect();
          const p = panel.current.getBoundingClientRect();
          return { x: r.left - p.left + r.width / 2 - 92, y: r.top - p.top + 18 };
        };
        const [p0, p1, p2] = [slot(0), slot(1), slot(2)];
        gsap.set(chip.current, { x: p0.x, y: p0.y, opacity: 0 });

        gsap
          .timeline({ repeat: -1, repeatDelay: 3.2 })
          .to(chip.current, { opacity: 1, duration: 0.3, ease: "power2.out" })
          .to(chip.current, { x: p1.x, y: p1.y, duration: 1.1, ease: "power3.inOut" })
          .to(chip.current, { x: p2.x, y: p2.y, duration: 1, ease: "power3.inOut" })
          .to(chip.current, { opacity: 0, duration: 0.3, ease: "power2.in" });
      });
    }, panel);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={panel} className="relative mx-auto w-full max-w-[620px]">
      <div
        className="overflow-hidden rounded-2xl border shadow-[0_50px_140px_rgba(0,0,0,0.8)]"
        style={{ borderColor: LINE, background: "#060606" }}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: LINE_SOFT, background: PANEL }}>
          <div className="flex items-center gap-2.5">
            <span className="flex size-6 items-center justify-center rounded-md text-[9px] font-bold" style={{ background: "#ffffff", color: "#000000" }}>
              WEB
            </span>
            <span className="text-[12.5px] font-semibold" style={{ color: TEXT }}>
              Website Redesign
            </span>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-medium" style={{ borderColor: LINE_SOFT, color: "#ffffff" }}>
            <span className="size-1.5 rounded-full bg-white" /> Live
          </span>
        </div>

        {/* columns */}
        <div className="grid grid-cols-3 gap-2 p-4">
          {COLUMNS.map((col, i) => (
            <div key={col.name} ref={(el) => { colRefs.current[i] = el; }} className="min-h-[196px] rounded-xl p-2" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${LINE_SOFT}` }}>
              <p className="mb-2.5 px-1 text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
                {col.name}
              </p>
              <div className="space-y-2">
                {col.dots.map((c) => (
                  <div key={c.label} className="rounded-lg border px-2.5 py-2" style={{ borderColor: LINE_SOFT, background: PANEL_2 }}>
                    <p className="truncate text-[11px] font-medium" style={{ color: TEXT }}>
                      {c.label}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="rounded px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-wide" style={{ color: "#a3a3a3", background: "rgba(255,255,255,0.08)" }}>
                        {c.tag}
                      </span>
                      <span className="font-mono text-[8.5px] tracking-[0.1em]" style={{ color: FAINT }}>
                        TASK-{102 + i * 7}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* traveler chip */}
          <div ref={chip} className="pointer-events-none absolute left-0 top-0 w-[180px] opacity-0" aria-hidden>
            <div className="rounded-xl border-2 px-3 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.7)]" style={{ borderColor: "#ffffff", background: "#0a0a0a" }}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[9px] font-bold tracking-[0.08em]" style={{ color: "#ffffff" }}>
                  TASK-104
                </span>
                <span className="rounded px-1.5 py-0.5 text-[8px] font-bold tracking-[0.12em]" style={{ background: "#ffffff", color: "#000000" }}>
                  URGENT
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] font-semibold" style={{ color: "#ffffff" }}>
                Secure checkout
              </p>
              <p className="mt-1 text-[8.5px]" style={{ color: "#666666" }}>
                Moving across columns…
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}