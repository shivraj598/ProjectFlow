import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { gsap, initGsap } from "./motion";
import { INK, LINE, MUTED, TEXT } from "./tokens";

export function LandingCta() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".cta-fade",
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden px-4 py-24 sm:px-6 lg:py-32" style={{ background: INK }}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full blur-[130px]"
        style={{ background: "rgba(255,255,255,0.05)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px w-[min(720px,80%)]"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)" }}
      />
      <div className="cta-fade relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 className="text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.03em]" style={{ color: TEXT }}>
          Build a workspace
          <br />
          that ships itself.
        </h2>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed" style={{ color: MUTED }}>
          Free for small teams. No spreadsheets, no patchworks — just a board your whole
          team can trust.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "#ffffff", color: "#000000" }}
          >
            Start free
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/login"
            className="rounded-full border px-7 py-3.5 text-[14px] font-semibold transition-colors hover:bg-white/10"
            style={{ borderColor: LINE, color: TEXT }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}