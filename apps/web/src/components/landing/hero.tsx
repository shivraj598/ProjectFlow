import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight, Flag, MousePointerClick } from "lucide-react";
import { gsap, initGsap, motionEnabled } from "./motion";
import { ACCENT, ACCENT_SOFT, FAINT, INK, LINE, MUTED, TEXT } from "./tokens";

const H1 = ["Plan", "the", "work.", "Ship", "the", "product."];

export function LandingHero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // kinetic word rise
        gsap.fromTo(
          ".hero-word",
          { yPercent: 120, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.05,
            ease: "power4.out",
            stagger: 0.075,
            delay: 0.25,
          }
        );
        // underline draw
        gsap.fromTo(
          ".hero-underline",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: "power3.inOut", delay: 0.9 }
        );
        gsap.fromTo(
          ".hero-sub, .hero-cta, .hero-eyebrow",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1, delay: 0.55 }
        );
        // product shot parallax
        gsap.fromTo(
          ".hero-shot",
          { y: 40, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.1,
            ease: "power3.out",
            delay: 0.7,
          }
        );
        gsap.to(".hero-shot", {
          y: -36,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        // floating chips
        gsap.to(".hero-chip", {
          y: -10,
          duration: 2.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          stagger: 0.5,
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-[100dvh] flex-col overflow-hidden"
      style={{ background: INK }}
    >
      {/* ambient: restrained radial wash + hairline grid */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute left-1/2 top-[-24%] h-[640px] w-[980px] -translate-x-1/2 rounded-full blur-[130px]"
          style={{ background: ACCENT_SOFT }}
        />
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, black 30%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, black 30%, transparent 78%)",
          }}
        />
      </div>

      {/* text block */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-6 pt-36 pb-10 text-center">
        <span
          className="hero-eyebrow inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-medium tracking-wide"
          style={{ color: MUTED, borderColor: LINE, background: "rgba(255,255,255,0.03)" }}
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: ACCENT }} />
            <span className="relative inline-flex size-1.5 rounded-full" style={{ background: ACCENT }} />
          </span>
          One real-time workspace for shipping teams
        </span>

        <h1
          className="mt-8 text-[clamp(2.9rem,7vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.03em]"
          style={{ color: TEXT }}
        >
          {H1.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-1 align-top">
              <span className={`hero-word inline-block will-change-transform ${i === 4 ? "italic" : ""}`}>
                {w === "product." ? (
                  <span className="relative">
                    product.
                    <span
                      className="hero-underline absolute -bottom-1 left-0 h-[0.14em] w-full origin-left rounded-full"
                      style={{ background: ACCENT, opacity: 0.85 }}
                    />
                  </span>
                ) : (
                  w
                )}
              </span>{" "}
            </span>
          ))}
        </h1>

        <p className="hero-sub mt-7 max-w-xl text-[clamp(15px,1.6vw,18px)] leading-relaxed" style={{ color: MUTED }}>
          Boards, sprints and analytics in one real-time workspace — from the first backlog
          item to launch day.
        </p>

        <div className="hero-cta mt-10 flex flex-wrap items-center justify-center gap-3">
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
      </div>

      {/* product shot bleeding below the fold */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-0">
        <div className="hero-shot relative overflow-hidden rounded-2xl border" style={{ borderColor: LINE }}>
          <img
            src="/images/03-dashboard.png"
            alt="ProjectFlow dashboard with analytics and activity feed"
            className="block w-full"
            loading="eager"
            fetchPriority="high"
            style={{ background: RAISED_BG }}
          />
          {/* dissolve into the next section */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
            style={{ background: "linear-gradient(to top, " + INK + " 12%, transparent)" }}
          />

          {/* floating chips (composition, not text badges) */}
          <div
            className="hero-chip absolute left-5 top-5 hidden items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-medium backdrop-blur-md sm:flex"
            style={{ borderColor: LINE, background: "rgba(13,17,24,0.78)", color: TEXT }}
          >
            <span className="flex size-1.5 rounded-full" style={{ background: "#3ddc97" }} />
            Sprint 1 · on track
          </div>
          <div
            className="hero-chip absolute bottom-6 right-5 hidden items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-medium backdrop-blur-md sm:flex"
            style={{ borderColor: LINE, background: "rgba(13,17,24,0.78)", color: TEXT }}
          >
            <Flag className="size-3.5" style={{ color: ACCENT }} />
            Ship week — 18 items closing
          </div>
        </div>
      </div>

      <div className="h-16" style={{ background: INK }} aria-hidden />
    </section>
  );
}

// explicit raised surface for the screenshot letterbox while loading
const RAISED_BG = "#121722";