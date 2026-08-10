import { useEffect, useRef } from "react";
import { gsap, initGsap } from "./motion";
import { FAINT, INK, MUTED, TEXT } from "./tokens";

const MANIFESTO =
  "ProjectFlow is the workspace where plans stop being documents and start being shipped — " +
  "columns move in real time, sprints close themselves, and the dashboard tells you, honestly, how it is going.";

export function LandingVoice() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>(".voice-word");
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          words,
          { opacity: 0.12 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.06,
            scrollTrigger: {
              trigger: root.current,
              start: "top 72%",
              end: "bottom 55%",
              scrub: 0.6,
            },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="voice" className="relative overflow-hidden py-32 lg:py-40" style={{ background: INK }}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
        style={{ background: "rgba(255,255,255,0.035)" }}
      />
      <div className="relative mx-auto w-full max-w-4xl px-6">
        <p className="mb-8 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em]" style={{ color: FAINT }}>
          <span className="h-px w-8 bg-white" /> The thesis
        </p>
        <p
          className="text-[clamp(1.4rem,2.7vw,2.2rem)] font-medium leading-[1.5] tracking-[-0.01em]"
          style={{ color: TEXT }}
        >
          {MANIFESTO.split(" ").map((w, i) => (
            <span key={i} className="voice-word inline-block will-change-[opacity]">
              {w}&nbsp;
            </span>
          ))}
        </p>
        <p className="mt-10 text-[13px]" style={{ color: MUTED }}>
          — the ProjectFlow team
        </p>
      </div>
    </section>
  );
}