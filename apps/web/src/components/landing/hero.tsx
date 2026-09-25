import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Check, MousePointer2, Play, Sparkles, Star } from "lucide-react";
import { gsap, initGsap } from "./motion";
import { FAINT, INK, LINE, LINE_SOFT, MUTED, TEXT } from "./tokens";

/* ------------------------------------------------------------------ */
/* Hero — modern centered + interactive dashboard covering bottom half */
/* ------------------------------------------------------------------ */

const VIEWS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "dashboard",
    src: "/images/03-dashboard.png",
    alt: "ProjectFlow main dashboard — status, priority, workload and 14-day trend",
    hotspots: [
      { x: "22%", y: "34%", title: "Workload, live", desc: "See who's overloaded before the sprint breaks." },
      { x: "64%", y: "30%", title: "14-day trend", desc: "Velocity, honest and updating in real time." },
      { x: "46%", y: "68%", title: "Priority split", desc: "Urgent vs high vs the rest — one glance." },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    path: "projects",
    src: "/images/04-board.png",
    alt: "Projects page — project list in the sidebar with the live team board",
    hotspots: [
      { x: "8%", y: "44%", title: "Projects list", desc: "Website Redesign, Platform API and more — one click away." },
      { x: "45%", y: "35%", title: "Live board", desc: "Drag cards across columns. WIP limits enforced." },
      { x: "80%", y: "12%", title: "Board / Backlog / Sprints", desc: "Switch project views without losing context." },
    ],
  },
  {
    id: "project",
    label: "Project",
    path: "projects/website-redesign",
    src: "/images/09-sprint-detail.png",
    alt: "Single project drill-down — Sprint 1 Platform Launch inside Website Redesign",
    hotspots: [
      { x: "30%", y: "14%", title: "Single project scope", desc: "Scoped to Website Redesign — nothing leaks across projects." },
      { x: "55%", y: "38%", title: "Sprint health", desc: "Tasks, story points and completion at a glance." },
    ],
  },
];

export function LandingHero() {
  const root = useRef<HTMLElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const shotWrap = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const view = VIEWS[active];

  /* entrance + ambient */
  useEffect(() => {
    initGsap();
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(".hero-word", { yPercent: 118, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.1 })
        .fromTo(".hero-kicker", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.6")
        .fromTo(".hero-sub", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, "-=0.45")
        .fromTo(".hero-cta", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, "-=0.4")
        .fromTo(".hero-proof", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.4")
        .fromTo(
          ".hero-shot",
          { y: 140, opacity: 0, scale: 0.96, transformOrigin: "50% 0%" },
          { y: 0, opacity: 1, scale: 1, duration: 1.35, ease: "power4.out" },
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

      // live cursor drift across the dashboard
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: 220,
          y: 60,
          duration: 3.2,
          ease: "power2.inOut",
          yoyo: true,
          repeat: -1,
          repeatDelay: 0.8,
        });
      }

      gsap.fromTo(
        ".hero-ghost",
        { xPercent: -8 },
        {
          xPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 1 },
        }
      );

      gsap.to(".hero-shot", {
        yPercent: 4,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    });
    return () => mm.revert();
  }, []);

  /* image crossfade on view switch */
  useEffect(() => {
    if (!imgRef.current) return;
    gsap.fromTo(
      imgRef.current,
      { opacity: 0.2, scale: 1.015 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out", overwrite: "auto" }
    );
  }, [active]);

  /* interactive 3D tilt + glare (desktop, pointer-fine only) */
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (!tiltRef.current || !shotWrap.current) return;
    initGsap();
    const xTo = gsap.quickTo(tiltRef.current, "rotationY", { duration: 0.7, ease: "power3.out" });
    const yTo = gsap.quickTo(tiltRef.current, "rotationX", { duration: 0.7, ease: "power3.out" });
    const el = shotWrap.current;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      xTo(nx * 10);
      yTo(-ny * 7);
      if (glareRef.current) {
        glareRef.current.style.background = `radial-gradient(420px circle at ${(nx + 0.5) * 100}% ${(ny + 0.5) * 100}%, rgba(255,255,255,0.12), transparent 65%)`;
      }
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section ref={root} id="top" className="relative overflow-hidden" style={{ background: INK }}>
      {/* ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(62% 44% at 50% -4%, rgba(255,255,255,0.09), transparent 62%), radial-gradient(36% 28% at 12% 10%, rgba(255,255,255,0.04), transparent 60%), radial-gradient(36% 28% at 88% 14%, rgba(255,255,255,0.05), transparent 60%)",
        }}
      />
      {/* beam */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2"
        style={{ background: "conic-gradient(from 180deg at 50% 0%, transparent 0deg, rgba(255,255,255,0.06) 20deg, transparent 40deg)", filter: "blur(10px)" }}
      />
      {/* grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(80% 58% at 50% 16%, black 10%, transparent 76%)",
          WebkitMaskImage: "radial-gradient(80% 58% at 50% 16%, black 10%, transparent 76%)",
        }}
      />
      {/* ghost */}
      <div
        aria-hidden
        className="hero-ghost pointer-events-none absolute left-1/2 top-[5%] -translate-x-1/2 select-none text-[20vw] font-extrabold leading-none tracking-[-0.05em] opacity-[0.035] will-change-transform"
        style={{ WebkitTextStroke: "1px #fff", color: "transparent", whiteSpace: "nowrap" }}
      >
        FLOW
      </div>

      {/* ================= TOP — copy ================= */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-32 text-center sm:px-6 lg:pt-40">
        {/* side rails — desktop editorial */}
        <span aria-hidden className="absolute left-0 top-1/2 hidden -translate-y-1/2 items-center gap-3 xl:flex" style={{ writingMode: "vertical-rl", transform: "rotate(180deg) translateY(50%)" }}>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: FAINT }}>Scroll to explore</span>
          <span className="mx-auto inline-block h-10 w-px bg-white/25" />
        </span>
        <span aria-hidden className="absolute right-0 top-1/2 hidden -translate-y-1/2 items-center gap-3 xl:flex" style={{ writingMode: "vertical-rl" }}>
          <span className="mx-auto inline-block h-10 w-px bg-white/25" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: FAINT }}>PF — 01 / Realtime</span>
        </span>

        <div className="hero-kicker mb-7 flex items-center justify-center gap-3">
          <span className="group flex items-center gap-2.5 rounded-full border py-1.5 pl-3.5 pr-2 backdrop-blur-md" style={{ borderColor: LINE, background: "rgba(255,255,255,0.04)" }}>
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-white" />
            </span>
            <span className="text-[12px] font-medium" style={{ color: MUTED }}>
              Real-time project workspace
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.08em] text-black transition-transform group-hover:scale-105">
              v2.0 <ArrowRight className="size-3" />
            </span>
          </span>
          <span className="hidden font-mono text-[11px] tracking-[0.14em] sm:block" style={{ color: FAINT }}>
            [ SYS / PF-01 ]
          </span>
        </div>

        <h1 className="mx-auto text-[clamp(2.9rem,8vw,6.4rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.045em]" style={{ color: TEXT }}>
          <span className="block overflow-hidden pb-1">
            <span className="hero-word block will-change-transform">Manage your</span>
          </span>
          <span className="block overflow-hidden pb-2">
            <span
              className="hero-word block will-change-transform normal-case italic"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                background: "linear-gradient(180deg, #ffffff 30%, #8c8c8c 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              projects
            </span>
          </span>
          <span className="block overflow-hidden pb-2">
            <span className="hero-word inline-block uppercase" style={{ background: "#ffffff", color: "#000000", padding: "0 0.16em 0.05em", boxShadow: "0 20px 80px rgba(255,255,255,0.18)" }}>
              Effectively.
            </span>
          </span>
        </h1>

        <p className="hero-sub mx-auto mt-7 max-w-[54ch] text-[16px] leading-relaxed" style={{ color: MUTED }}>
          Boards, sprints and analytics that update{" "}
          <span className="font-semibold" style={{ color: TEXT }}>the second your team moves</span> —
          no refresh, no status meetings.{" "}
          <span className="font-serif italic" style={{ color: TEXT }}>Start in minutes, feel it in seconds.</span>
        </p>

        <div className="hero-cta mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full py-2 pl-7 pr-2 text-[14px] font-semibold transition-all hover:opacity-95 active:scale-[0.98]"
            style={{ background: "#ffffff", color: "#000000", boxShadow: "0 12px 50px rgba(255,255,255,0.22)" }}
          >
            <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            Start free
            <span className="flex size-9 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:rotate-[-35deg]">
              <ArrowRight className="size-4" />
            </span>
          </Link>
          <a
            href="#showcase"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group inline-flex items-center gap-3 rounded-full border py-2 pl-2 pr-7 text-[14px] font-semibold backdrop-blur-md transition-colors hover:bg-white/10"
            style={{ borderColor: LINE, color: TEXT, background: "rgba(255,255,255,0.02)" }}
          >
            <span className="flex size-9 items-center justify-center rounded-full border transition-colors duration-300 group-hover:bg-white group-hover:text-black" style={{ borderColor: LINE }}>
              <Play className="size-3.5 fill-current" />
            </span>
            Watch it move
            <span className="font-mono text-[10px] font-normal" style={{ color: FAINT }}>2 min</span>
          </a>
        </div>
        <p className="hero-cta mt-4 font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: FAINT }}>
          Free 14-day trial · No credit card · Cancel anytime
        </p>

        <div className="hero-proof mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
          <div className="flex -space-x-2">
            {["AC", "MO", "LM", "IR"].map((a, i) => (
              <span key={a} className="flex size-7 items-center justify-center rounded-full text-[9px] font-bold ring-2 ring-black" style={{ background: i === 0 ? "#fff" : "rgba(255,255,255,0.12)", color: i === 0 ? "#000" : "#fff", border: "1px solid rgba(255,255,255,0.25)" }}>
                {a}
              </span>
            ))}
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-[8px] font-bold text-black ring-2 ring-black">
              2k+
            </span>
          </div>
          <span className="h-4 w-px bg-white/15" aria-hidden />
          <span className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3.5 fill-white text-white" />
            ))}
          </span>
          <span className="text-[12.5px]" style={{ color: MUTED }}>
            <span className="font-semibold" style={{ color: TEXT }}>4.9/5</span> — loved by 2,000+ early teams
          </span>
        </div>

        {/* interactive hint */}
        <p className="mt-8 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: FAINT }}>
          <MousePointer2 className="size-3.5" />
          Hover the dashboard — tilt · hotspots · switch views
        </p>
      </div>

      {/* ================= BOTTOM HALF — interactive dashboard ================= */}
      <div className="relative z-10 mx-auto mt-8 w-full max-w-7xl px-4 sm:px-6" style={{ perspective: "1600px" }}>
        {/* view switcher */}
        <div className="mb-4 flex justify-center gap-2 overflow-x-auto pb-1">
          {VIEWS.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setActive(i)}
              className="flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[12.5px] font-medium backdrop-blur-md transition-all duration-300"
              style={{
                borderColor: i === active ? "#fff" : LINE,
                background: i === active ? "#fff" : "rgba(255,255,255,0.03)",
                color: i === active ? "#000" : MUTED,
              }}
            >
              <span className="font-mono text-[10px]" style={{ opacity: 0.7 }}>
                0{i + 1}
              </span>
              {v.label}
              {i === active && <span className="size-1.5 animate-pulse rounded-full bg-black" />}
            </button>
          ))}
        </div>

        <div ref={shotWrap} className="relative" style={{ transformStyle: "preserve-3d" }}>
          {/* floating chips */}
          <div aria-hidden className="float-chip-a hero-float pointer-events-none absolute -top-8 left-2 z-30 hidden select-none md:block lg:left-6">
            <Chip title="Sprint 4 · burndown" value="On track" icon={<Sparkles className="size-3.5" />} fine="-3 pts vs ideal" />
          </div>
          <div aria-hidden className="float-chip-b hero-float pointer-events-none absolute -top-4 right-2 z-30 hidden select-none md:block lg:right-6">
            <Chip title="TASK-104" value="Moved to Done" icon={<Check className="size-3.5" />} fine="Just now · Ava" accent />
          </div>

          {/* glow */}
          <div aria-hidden className="pointer-events-none absolute -inset-x-10 top-10 bottom-0 blur-3xl" style={{ background: "radial-gradient(60% 60% at 50% 18%, rgba(255,255,255,0.12), transparent 70%)" }} />

          {/* tilt layer — covers bottom half, bleeds to section edge */}
          <div ref={tiltRef} className="hero-shot relative will-change-transform" style={{ transformStyle: "preserve-3d" }}>
            <div className="relative overflow-hidden rounded-t-2xl border border-b-0 shadow-[0_60px_180px_rgba(0,0,0,0.9)]" style={{ borderColor: LINE, background: "#060606" }}>
              {/* chrome */}
              <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: LINE_SOFT, background: "rgba(10,10,10,0.95)" }}>
                <span className="flex gap-1.5">
                  <i className="size-2.5 rounded-full bg-white/20" />
                  <i className="size-2.5 rounded-full bg-white/20" />
                  <i className="size-2.5 rounded-full bg-white" />
                </span>
                <span className="mx-auto hidden w-full max-w-xs truncate rounded-full border px-3 py-1 text-center font-mono text-[10.5px] sm:block" style={{ borderColor: LINE_SOFT, color: FAINT }}>
                  projectflow.app / {view.path}
                </span>
                <span className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-medium" style={{ borderColor: LINE_SOFT, color: "#fff" }}>
                  <span className="size-1.5 animate-pulse rounded-full bg-white" /> Live · {view.label}
                </span>
              </div>

              {/* interactive screenshot */}
              <div className="group/shot relative cursor-crosshair overflow-hidden">
                <img
                  ref={imgRef}
                  key={view.src}
                  src={view.src}
                  alt={view.alt}
                  className="block aspect-[16/9] w-full object-cover object-top transition-transform duration-700"
                  loading="eager"
                  draggable={false}
                />
                {/* mouse glare */}
                <div ref={glareRef} aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/shot:opacity-100" />
                {/* hover zoom veil */}
                <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/shot:opacity-100" style={{ boxShadow: "inset 0 0 140px rgba(0,0,0,0.5)" }} />

                {/* simulated live cursor */}
                <div ref={cursorRef} aria-hidden className="pointer-events-none absolute left-[18%] top-[38%] z-20 hidden sm:block">
                  <div className="flex items-center gap-2 rounded-full border bg-black/85 py-1.5 pl-2 pr-3 shadow-2xl backdrop-blur-md" style={{ borderColor: "#fff" }}>
                    <MousePointer2 className="size-3.5 fill-white text-white" />
                    <span className="text-[10.5px] font-semibold text-white">Ava is dragging TASK-104</span>
                  </div>
                </div>

                {/* hotspots */}
                {view.hotspots.map((h) => (
                  <div key={h.title} className="group/hot absolute z-20" style={{ left: h.x, top: h.y }}>
                    <button
                      aria-label={h.title}
                      className="relative flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-black/80 backdrop-blur-md transition-transform hover:scale-125"
                      style={{ borderColor: "#fff" }}
                    >
                      <span className="absolute inset-0 animate-ping rounded-full bg-white/30" />
                      <span className="relative size-1.5 rounded-full bg-white" />
                    </button>
                    {/* tooltip */}
                    <div className="pointer-events-none absolute left-4 top-4 w-52 -translate-y-1/2 rounded-xl border p-3 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-300 group-hover/hot:pointer-events-auto group-hover/hot:opacity-100" style={{ borderColor: LINE, background: "rgba(8,8,8,0.94)" }}>
                      <p className="text-[12px] font-semibold text-white">{h.title}</p>
                      <p className="mt-1 text-[11.5px] leading-snug" style={{ color: MUTED }}>{h.desc}</p>
                    </div>
                  </div>
                ))}

                {/* bottom fade — dashboard melts into next section */}
                <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28" style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.92) 100%)" }} />
              </div>
            </div>

            {/* reflection hairline */}
            <div aria-hidden className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.45), transparent)" }} />
          </div>
        </div>

        {/* data strip attached to dashboard bottom */}
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
