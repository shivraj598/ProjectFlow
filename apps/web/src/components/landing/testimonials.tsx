import { useEffect, useRef } from "react";
import { gsap, initGsap } from "./motion";
import { FAINT, LINE, MUTED, TEXT } from "./tokens";

const QUOTES = [
  {
    quote: "We stopped living in a spreadsheet and a chat log. The board is the plan, the plan is the board.",
    name: "Ava Chen",
    role: "Head of Product, Nimbus Labs",
    initials: "AC",
  },
  {
    quote: "Burndown used to be a Friday ritual of manual number-pushing. Now it is a line on a screen I glance at.",
    name: "Maya Okafor",
    role: "Engineering Manager, Nimbus Labs",
    initials: "MO",
  },
  {
    quote: "New people read the activity timeline and understand two weeks of context in five minutes.",
    name: "Leo Martens",
    role: "Design Lead, Nimbus Labs",
    initials: "LM",
  },
];

export function LandingTestimonials() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".quote-card",
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: root.current, start: "top 76%", once: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="customers" className="relative py-24 lg:py-32" style={{ background: "#000000" }}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2
            className="max-w-lg text-[clamp(1.8rem,3.4vw,2.7rem)] font-bold leading-[1.05] tracking-[-0.02em]"
            style={{ color: TEXT }}
          >
            Quiet teams, louder <span className="inline-block bg-white px-1.5 text-black">results.</span>
          </h2>
          <span className="rounded-full border px-3.5 py-1.5 text-[12px] font-medium" style={{ color: MUTED, borderColor: LINE }}>
            Nimbus Labs · seed demo org
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {QUOTES.map((q) => (
            <figure
              key={q.name}
              className="quote-card group flex flex-col justify-between rounded-2xl border p-7 transition-colors duration-300 hover:border-[rgba(255,255,255,0.28)]"
              style={{ borderColor: LINE, background: "#050505" }}
            >
              <blockquote>
                <span className="mb-4 block text-[40px] leading-none text-white" aria-hidden>
                  &ldquo;
                </span>
                <p className="text-[15px] leading-relaxed" style={{ color: TEXT }}>
                  {q.quote}
                </p>
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <span
                  className="flex size-9 items-center justify-center rounded-full text-[11px] font-bold"
                  style={{ background: "#ffffff", color: "#000000" }}
                >
                  {q.initials}
                </span>
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: TEXT }}>
                    {q.name}
                  </p>
                  <p className="text-[12px]" style={{ color: FAINT }}>
                    {q.role}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}