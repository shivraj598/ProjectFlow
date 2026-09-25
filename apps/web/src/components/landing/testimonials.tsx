import { useEffect, useRef } from "react";
import { ArrowUpRight, BadgeCheck, Quote, Star } from "lucide-react";
import { gsap, initGsap } from "./motion";
import { ACCENT, ACCENT_SOFT, FAINT, INK, LINE, LINE_SOFT, MUTED, ON_ACCENT, PANEL, PANEL_2, TEXT } from "./tokens";

const QUOTES = [
  {
    index: "01",
    quote:
      "We stopped living in a spreadsheet and a chat log. The board is the plan, the plan is the board.",
    name: "Ava Chen",
    role: "Head of Product, Nimbus Labs",
    initials: "AC",
    metric: "−6h",
    metricLabel: "meetings / week",
  },
  {
    index: "02",
    quote:
      "Burndown used to be a Friday ritual of manual number-pushing. Now it is a line on a screen I glance at.",
    name: "Maya Okafor",
    role: "Engineering Manager, Nimbus Labs",
    initials: "MO",
    metric: "42 pts",
    metricLabel: "shipped / sprint",
  },
  {
    index: "03",
    quote:
      "New people read the activity timeline and understand two weeks of context in five minutes.",
    name: "Leo Martens",
    role: "Design Lead, Nimbus Labs",
    initials: "LM",
    metric: "5 min",
    metricLabel: "to onboard",
  },
];

const LOGOS = ["NIMBUS", "HELIX", "VANTA", "NORTHLOOP", "PARSEC", "FIELDKIT"];

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
            scrollTrigger: { trigger: ".quote-grid", start: "top 80%", once: true },
          }
        );
        gsap.fromTo(
          ".t-head",
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: root.current, start: "top 82%", once: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="customers"
      className="relative overflow-hidden border-t py-16 lg:py-24"
      style={{ borderColor: LINE, background: INK }}
    >
      {/* faint radiance */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 36% at 50% 0%, rgba(255,255,255,0.05), transparent 65%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* ---------- header ---------- */}
        <div className="mb-10 flex flex-col gap-8 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p
              className="t-head mb-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em]"
              style={{ color: FAINT }}
            >
              <span className="inline-block h-px w-8 bg-[var(--ld-accent)] opacity-60" />
              [ 05 — Field notes ]
            </p>
            <h2
              className="t-head text-[clamp(1.9rem,3.6vw,3rem)] font-bold leading-[1.04] tracking-[-0.02em]"
              style={{ color: TEXT }}
            >
              Quiet teams, louder
              <br />
              <span className="inline-block bg-[var(--ld-accent)] px-2 text-[var(--ld-on-accent)]">results.</span>
            </h2>
            {/* social proof row */}
            <div className="t-head mt-6 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-2">
                {QUOTES.map((q) => (
                  <span
                    key={q.initials}
                    className="flex size-8 items-center justify-center rounded-full border text-[10px] font-bold"
                    style={{ background: ACCENT, color: ON_ACCENT, borderColor: INK }}
                  >
                    {q.initials}
                  </span>
                ))}
                <span
                  className="flex size-8 items-center justify-center rounded-full border text-[9px] font-bold"
                    style={{ background: PANEL_2, color: TEXT, borderColor: LINE }}
                >
                  +2k
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex gap-0.5" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-[var(--ld-accent)] text-[var(--ld-accent)]" />
                  ))}
                </span>
                <span className="text-[12.5px] font-medium" style={{ color: TEXT }}>
                  4.9/5
                </span>
                <span className="font-mono text-[11px]" style={{ color: FAINT }}>
                  from early teams
                </span>
              </div>
            </div>
          </div>

          <div className="t-head flex flex-col items-start gap-3 lg:items-end">
            <span
              className="rounded-full border px-3.5 py-1.5 text-[12px] font-medium"
              style={{ color: MUTED, borderColor: LINE }}
            >
              Nimbus Labs · seed demo org
            </span>
            <p className="max-w-xs text-[13px] leading-relaxed lg:text-right" style={{ color: FAINT }}>
              Real workflows, real sprints. No scripts — just teams that
              stopped chasing status.
            </p>
          </div>
        </div>

        {/* ---------- cards ---------- */}
        <div className="quote-grid grid gap-px overflow-hidden rounded-2xl border md:grid-cols-3" style={{ borderColor: LINE, background: LINE }}>
          {QUOTES.map((q) => (
            <figure
              key={q.name}
              className="quote-card group relative flex min-h-[380px] flex-col bg-[var(--ld-ink)] p-6 transition-colors duration-300 hover:bg-[var(--ld-panel)] sm:p-7"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-[var(--ld-accent)] transition-transform duration-500 group-hover:scale-x-100"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(80% 50% at 50% 0%, rgba(255,255,255,0.07), transparent 70%)",
                }}
              />

              <div className="relative flex items-start justify-between">
                <span
                  className="flex size-9 items-center justify-center rounded-xl border transition-all duration-300 group-hover:bg-[var(--ld-accent)] group-hover:text-[var(--ld-on-accent)]"
                  style={{ borderColor: LINE, color: TEXT }}
                >
                  <Quote className="size-4 fill-current" />
                </span>
                <span className="font-mono text-[11px] tracking-[0.18em]" style={{ color: FAINT }}>
                  {q.index}
                </span>
              </div>

              <div className="relative mt-5 flex gap-0.5" aria-label="5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3 fill-[var(--ld-accent)] text-[var(--ld-accent)]" />
                ))}
              </div>

              <blockquote className="relative mt-4">
                <p className="text-[16px] font-medium leading-[1.6] tracking-[-0.01em]" style={{ color: TEXT }}>
                  &ldquo;{q.quote}&rdquo;
                </p>
              </blockquote>

              {/* metric */}
              <div
                className="relative mt-5 flex items-baseline gap-2 rounded-xl border px-3 py-2.5"
                style={{ borderColor: LINE_SOFT, background: ACCENT_SOFT }}
              >
                <span className="bg-[var(--ld-accent)] px-1.5 text-[15px] font-bold tracking-tight text-[var(--ld-on-accent)]">
                  {q.metric}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: FAINT }}>
                  {q.metricLabel}
                </span>
              </div>

              <figcaption
                className="relative mt-auto flex items-center gap-3 border-t pt-5"
                style={{ borderColor: LINE_SOFT, marginTop: "auto", paddingTop: "20px" }}
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-1"
                  style={{ background: ACCENT, color: ON_ACCENT, ["--tw-ring-color" as string]: LINE } as React.CSSProperties}
                >
                  {q.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: TEXT }}>
                    <span className="truncate">{q.name}</span>
                    <BadgeCheck className="size-3.5 shrink-0 text-[var(--ld-muted)]" />
                  </p>
                  <p className="truncate text-[12px]" style={{ color: FAINT }}>
                    {q.role}
                  </p>
                </div>
                <span
                  className="flex size-7 shrink-0 items-center justify-center rounded-full border opacity-40 transition-all duration-300 group-hover:border-[var(--ld-accent)] group-hover:bg-[var(--ld-accent)] group-hover:text-[var(--ld-on-accent)] group-hover:opacity-100"
                  style={{ borderColor: LINE }}
                >
                  <ArrowUpRight className="size-3.5" />
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* ---------- logo strip ---------- */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: FAINT }}>
            Trusted in production by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {LOGOS.map((l) => (
              <span
                key={l}
                className="font-mono text-[12px] font-semibold tracking-[0.18em] transition-colors hover:text-[var(--ld-text)]"
                style={{ color: FAINT }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
