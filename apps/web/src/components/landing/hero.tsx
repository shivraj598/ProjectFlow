import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight, Check, GitPullRequestArrow, MousePointerClick } from "lucide-react";
import { gsap, initGsap } from "./motion";
import { ACCENT, ACCENT_SOFT, FAINT, INK, LINE, MUTED, TEXT } from "./tokens";

const H1_WORDS = ["Work", "that", "moves", "itself."];

const SHIPPING = ["Real-time by default", "Boards, sprints, analytics", "One signup, zero setup"];

export function LandingHero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".hero-word",
          { yPercent: 120, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.05, ease: "power4.out", stagger: 0.08, delay: 0.2 }
        );
        gsap.fromTo(
          ".hero-underline",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: "power3.inOut", delay: 0.85 }
        );
        gsap.fromTo(
          ".hero-eyebrow, .hero-sub, .hero-cta, .shipping-item",
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.08, delay: 0.5 }
        );
        gsap.fromTo(
          ".live-board",
          { y: 30, opacity: 0, rotateX: 6, scale: 0.985 },
          { y: 0, opacity: 1, rotateX: 0, scale: 1, duration: 1, ease: "power3.out", delay: 0.7 }
        );
        gsap.to(".live-board", {
          yPercent: -4,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="top"
      className="relative overflow-hidden [perspective:1400px]"
      style={{ background: INK }}
    >
      {/* ambient */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute left-[8%] top-[-30%] h-[640px] w-[760px] rounded-full blur-[140px]"
          style={{ background: ACCENT_SOFT }}
        />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 75% 60% at 40% 0%, black 25%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 75% 60% at 40% 0%, black 25%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-14 px-6 pb-16 pt-40 md:pt-44 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pb-24">
        {/* copy */}
        <div className="text-center lg:text-left">
          <span
            className="hero-eyebrow inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-medium tracking-wide"
            style={{ color: MUTED, borderColor: LINE, background: "rgba(255,255,255,0.03)" }}
          >
            <GitPullRequestArrow className="size-3.5" style={{ color: ACCENT }} />
            A workspace where work plays itself
          </span>

          <h1
            className="mx-auto mt-7 max-w-xl text-[clamp(2.8rem,5.4vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.03em] lg:mx-0"
            style={{ color: TEXT }}
          >
            {H1_WORDS.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-1 align-top">
                <span className={`hero-word inline-block will-change-transform ${i === 3 ? "italic" : ""}`}>
                  {w === "itself." ? (
                    <span className="relative">
                      itself.
                      <span
                        className="hero-underline absolute -bottom-1 left-0 h-[0.14em] w-full origin-left rounded-full"
                        style={{ background: ACCENT, opacity: 0.9 }}
                      />
                    </span>
                  ) : (
                    w
                  )}
                </span>{" "}
              </span>
            ))}
          </h1>

          <p className="hero-sub mx-auto mt-6 max-w-md text-[clamp(15px,1.5vw,17px)] leading-relaxed lg:mx-0" style={{ color: MUTED }}>
            Boards, sprints and analytics that update in real time — watch a task drag itself
            to done, then build your own in minutes.
          </p>

          <div className="hero-cta mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              to="/register"
              className="group flex h-12 items-center gap-2 rounded-xl px-6 text-[15px] font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
              style={{ background: ACCENT, boxShadow: `0 14px 40px -14px ${ACCENT_SOFT}` }}
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
              className="flex h-12 items-center gap-2 rounded-xl border px-6 text-[15px] font-semibold transition-colors hover:bg-white/5"
              style={{ color: TEXT, borderColor: LINE }}
            >
              <MousePointerClick className="size-4" style={{ color: MUTED }} />
              Explore the demo
            </a>
          </div>

          {/* quiet shipping strip — below the hero copy, not inside it */}
          <ul className="hero-sub mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-start">
            {SHIPPING.map((s) => (
              <li key={s} className="flex items-center gap-2 text-[12.5px]" style={{ color: FAINT }}>
                <Check className="size-3.5" style={{ color: "#3ddc97" }} />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* live board — the product, playing itself */}
        <LiveBoard />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Live kanban — a task chip physically travels the columns on a loop  */
/* ------------------------------------------------------------------ */

const COLUMNS = [
  { name: "Backlog", dot: "#8b98a8", chips: ["Finalize sprint scope", "Review onboarding copy"] },
  { name: "In progress", dot: ACCENT, chips: ["Dark mode flicker fix"] },
  { name: "Done", dot: "#3ddc97", chips: ["Setup analytics events"] },
];

const TRAVELER = { tag: "TASK-104", title: "Secure checkout", meta: "urgent", metaColor: "#f56a6a" };

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
          if (!col) return { x: 0, y: 0 };
          const r = col.getBoundingClientRect();
          const p = panel.current!.getBoundingClientRect();
          return { x: r.left - p.left + r.width / 2 - 74, y: r.top - p.top + 16 };
        };

        const [p0, p1, p2] = [slot(0), slot(1), slot(2)];
        gsap.set(chip.current, { x: p0.x, y: p0.y, opacity: 0 });

        gsap
          .timeline({ repeat: -1, repeatDelay: 2.6 })
          .to(chip.current, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" })
          .to(chip.current, { x: p1.x, y: p1.y, duration: 1.15, ease: "power3.inOut" })
          .to(chip.current, { x: p2.x, y: p2.y, duration: 1.05, ease: "power3.inOut" })
          .to(chip.current, { scale: 1.06, duration: 0.22, ease: "back.out(2)" })
          .to(chip.current, { opacity: 0, scale: 0.72, duration: 0.35, ease: "power2.in" })
          .to(
            colRefs.current[2],
            { boxShadow: `0 0 0 1.5px ${ACCENT}66`, duration: 0.25, yoyo: true, repeat: 1 },
            "<"
          );
      });
    }, panel);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={panel} className="live-board relative mx-auto w-full max-w-[560px]">
      <div
        className="rounded-2xl border p-5"
        style={{ borderColor: LINE, background: "linear-gradient(160deg,#121722 0%,#0d1117 100%)", boxShadow: "0 40px 80px -40px rgba(0,0,0,0.85)" }}
      >
        {/* panel header */}
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
          <span className="ml-auto flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: ACCENT_SOFT, color: ACCENT }}>
            <span className="size-1.5 animate-pulse rounded-full" style={{ background: ACCENT }} />
            live
          </span>
        </div>

        {/* columns */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {COLUMNS.map((col, i) => (
            <div
              key={col.name}
              ref={(el) => { colRefs.current[i] = el; }}
              className="min-h-[176px] rounded-xl p-2 transition-[box-shadow]"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <div className="mb-2 flex items-center gap-1.5 px-1">
                <span className="size-1.5 rounded-full" style={{ background: col.dot }} />
                <span className="text-[10px] font-semibold" style={{ color: FAINT }}>
                  {col.name}
                </span>
              </div>
              <div className="space-y-1.5">
                {col.chips.map((c) => (
                  <div key={c} className="rounded-lg border px-2 py-1.5" style={{ borderColor: LINE, background: "rgba(18,23,34,0.9)" }}>
                    <p className="truncate text-[11px] font-medium" style={{ color: TEXT }}>
                      {c}
                    </p>
                    <p className="mt-0.5 font-mono text-[8px]" style={{ color: FAINT }}>
                      TASK-{String(100 + i).slice(-2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* traveler ghost chip */}
      <div
        ref={chip}
        className="pointer-events-none absolute left-0 top-0 w-24 opacity-0"
        aria-hidden
      >
        <div className="rounded-lg border p-2" style={{ borderColor: `${TRAVELER.metaColor}55`, background: "#151a24", boxShadow: `0 16px 32px -12px rgba(0,0,0,0.7), 0 0 0 1px ${TRAVELER.metaColor}33` }}>
          <div className="flex items-center gap-1">
            <GitPullRequestArrow className="size-3" style={{ color: TRAVELER.metaColor }} />
            <span className="font-mono text-[8px] font-bold" style={{ color: ACCENT }}>
              {TRAVELER.tag}
            </span>
            <span
              className="ml-auto rounded px-1 text-[7px] font-bold uppercase"
              style={{ color: TRAVELER.metaColor, background: `${TRAVELER.metaColor}22` }}
            >
              {TRAVELER.meta}
            </span>
          </div>
          <p className="mt-1 truncate text-[10px] font-medium" style={{ color: TEXT }}>
            {TRAVELER.title}
          </p>
        </div>
      </div>

      {/* caption */}
      <div className="mt-3 flex items-center justify-between px-1">
        <p className="flex items-center gap-1.5 text-[11px]" style={{ color: FAINT }}>
          <span className="size-1.5 rounded-full" style={{ background: "#3ddc97" }} />
          The board, mid-move
        </p>
        <p className="font-mono text-[11px]" style={{ color: FAINT }}>
          14 / 42 pts
        </p>
      </div>
    </div>
  );
}