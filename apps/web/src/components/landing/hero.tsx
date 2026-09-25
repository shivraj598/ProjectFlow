import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight, Check, Play, Sparkles, Star } from "lucide-react";
import { gsap, initGsap } from "./motion";
import { FAINT, INK, LINE, LINE_SOFT, MUTED, TEXT } from "./tokens";

/* ------------------------------------------------------------------ */
/* Hero — centered copy (top half) + dashboard rising from bottom half */
/* ------------------------------------------------------------------ */

export function LandingHero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(".hero-word", { yPercent: 118, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.1 })
        .fromTo(".hero-kicker", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.6")
        .fromTo(".hero-cta", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, "-=0.4")
        .fromTo(".hero-proof", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.4")
        .fromTo(
          ".hero-shot",
          { y: 120, opacity: 0, scale: 0.96, transformOrigin: "50% 0%" },
          { y: 0, opacity: 1, scale: 1, duration: 1.3, ease: "power4.out" },
          "-=0.5"
        )
        .fromTo(".hero-float", { opacity: 0, scale: 0.85, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.12 }, "-=0.7")
        .fromTo(".hero-rail", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.09 }, "-=0.5");

      gsap.to(".hero-float", {
        y: -10,
        duration: 2.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.6, yoyo: true },
      });

      gsap.fromTo(
        ".hero-ghost",
        { xPercent: -8 },
        {
          xPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 1 },
        }
      );

      // dashboard parallax — sinks slightly as you scroll into capabilities
      gsap.to(".hero-shot", {
        yPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".float-chip-a", {
        y: -50,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".float-chip-b", {
        y: -24,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="top" className="relative overflow-hidden" style={{ background: INK }}>
      {/* radiance */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 42% at 50% 0%, rgba(255,255,255,0.07), transparent 62%), radial-gradient(40% 30% at 12% 12%, rgba(255,255,255,0.03), transparent 60%)",
        }}
      />
      {/* blueprint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(78% 60% at 50% 18%, black 10%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(78% 60% at 50% 18%, black 10%, transparent 75%)",
        }}
      />
      {/* ghost wordmark */}
      <div
        aria-hidden
        className="hero-ghost pointer-events-none absolute left-1/2 top-[6%] -translate-x-1/2 select-none text-[20vw] font-extrabold leading-none tracking-[-0.05em] opacity-[0.04] will-change-transform"
        style={{ WebkitTextStroke: "1px #fff", color: "transparent", whiteSpace: "nowrap" }}
      >
        FLOW
      </div>

      {/* ================= TOP HALF — copy ================= */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-32 text-center sm:px-6 lg:pt-40">
        <div className="hero-kicker mb-7 flex items-center justify-center gap-4">
          <span className="flex items-center gap-2.5 rounded-full border px-3.5 py-1.5" style={{ borderColor: LINE, background: "rgba(255,255,255,0.03)" }}>
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
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

        <h1 className="mx-auto text-[clamp(3rem,8.4vw,6.6rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.045em]" style={{ color: TEXT }}>
          <span className="block overflow-hidden pb-1">
            <span className="hero-word block will-change-transform">Manage your</span>
          </span>
          <span className="block overflow-hidden pb-1">
            <span
              className="hero-word block will-change-transform uppercase"
              style={{ color: "transparent", WebkitTextStroke: "2px #ffffff" }}
            >
              projects
            </span>
          </span>
          <span className="block overflow-hidden pb-2">
            <span className="hero-word inline-block uppercase" style={{ background: "#ffffff", color: "#000000", padding: "0 0.16em 0.05em" }}>
              Effectively.
            </span>
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-[52ch] text-[16px] leading-relaxed" style={{ color: MUTED }}>
          Boards, sprints and analytics that update in real time — watch a task
          drag itself to done, then build your own in minutes.
        </p>

        <div className="hero-cta mt-8 flex flex-wrap items-center justify-center gap-3">
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
            className="group inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-[14px] font-semibold transition-colors hover:bg-white/10"
            style={{ borderColor: LINE, color: TEXT }}
          >
            <Play className="size-4 fill-current" />
            Watch it move
          </a>
        </div>

        <div className="hero-proof mt-7 flex flex-wrap items-center justify-center gap-4">
          <div className="flex -space-x-2">
            {["AC", "MO", "LM", "IR"].map((a) => (
              <span key={a} className="flex size-7 items-center justify-center rounded-full border text-[9px] font-bold" style={{ background: "#fff", color: "#000", borderColor: "#000" }}>
                {a}
              </span>
            ))}
          </div>
          <span className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-white text-white" />
            ))}
          </span>
          <span className="text-[12.5px]" style={{ color: MUTED }}>
            Loved by early teams · No credit card
          </span>
        </div>
      </div>

      {/* ================= BOTTOM HALF — dashboard ================= */}
      <div className="relative z-10 mx-auto mt-14 w-full max-w-6xl px-4 sm:px-6">
        <div className="relative">
          {/* floating readout chips */}
          <div aria-hidden className="float-chip-a hero-float pointer-events-none absolute -top-6 left-0 z-20 hidden select-none md:block lg:-left-8">
            <Chip title="Sprint 4 · burndown" value="On track" icon={<Sparkles className="size-3.5" />} fine="-3 pts vs ideal" />
          </div>
          <div aria-hidden className="float-chip-b hero-float pointer-events-none absolute -top-2 right-0 z-20 hidden select-none md:block lg:-right-8">
            <Chip title="TASK-104" value="Moved to Done" icon={<Check className="size-3.5" />} fine="Just now · Ava" accent />
          </div>

          {/* glow */}
          <div aria-hidden className="pointer-events-none absolute -inset-x-8 top-8 bottom-0 blur-3xl" style={{ background: "radial-gradient(60% 60% at 50% 20%, rgba(255,255,255,0.09), transparent 70%)" }} />

          {/* browser frame */}
          <div className="hero-shot relative overflow-hidden rounded-t-2xl border border-b-0 shadow-[0_60px_160px_rgba(0,0,0,0.85)] will-change-transform" style={{ borderColor: LINE, background: "#060606" }}>
            {/* chrome bar */}
            <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: LINE_SOFT, background: "#0a0a0a" }}>
              <span className="flex gap-1.5">
                <i className="size-2.5 rounded-full bg-white/20" />
                <i className="size-2.5 rounded-full bg-white/20" />
                <i className="size-2.5 rounded-full bg-white" />
              </span>
              <span className="mx-auto hidden w-full max-w-xs truncate rounded-full border px-3 py-1 text-center font-mono text-[10.5px] sm:block" style={{ borderColor: LINE_SOFT, color: FAINT }}>
                projectflow.app / dashboard
              </span>
              <span className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-medium" style={{ borderColor: LINE_SOFT, color: "#fff" }}>
                <span className="size-1.5 animate-pulse rounded-full bg-white" /> Live
              </span>
            </div>
            {/* screenshot */}
            <div className="relative">
              <img
                src="/images/03-dashboard.png"
                alt="ProjectFlow analytics dashboard — status, priority, workload and 14-day trend"
                className="block w-full object-cover object-top"
                loading="eager"
              />
              {/* bottom fade into next section */}
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40" style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.55) 70%, #000 100%)" }} />
              {/* side vignette */}
              <div aria-hidden className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 120px rgba(0,0,0,0.45)" }} />
            </div>
          </div>

          {/* reflection hairline */}
          <div aria-hidden className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)" }} />
        </div>

        {/* data strip — transition into capabilities */}
        <div className="hero-rail relative z-10 grid grid-cols-2 gap-px border-x border-b sm:grid-cols-3" style={{ borderColor: LINE, background: LINE }}>
          <StripCell label="System status" value="Online · 14/42 pts" live />
          <StripCell label="Delta (real-time)" value="~0 ms" hideOnMobile />
          <StripCell label="Next sprint" value="Sprint 5 · In 3 days" scroll />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function StripCell({ label, value, live, scroll, hideOnMobile }: { label: string; value: string; live?: boolean; scroll?: boolean; hideOnMobile?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 ${hideOnMobile ? "hidden sm:flex" : ""}`} style={{ background: INK }}>
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

function Chip({ title, value, icon, fine, accent }: { title: string; value: string; icon: React.ReactNode; fine?: string; accent?: boolean }) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 shadow-[0_16px_50px_rgba(0,0,0,0.6)] backdrop-blur-md"
      style={{ borderColor: accent ? "#ffffff" : LINE, background: "rgba(8,8,8,0.92)" }}
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
