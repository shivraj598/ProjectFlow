import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight, KanbanSquare } from "lucide-react";
import { gsap, initGsap } from "./motion";
import { ACCENT, ACCENT_SOFT, FAINT, INK, LINE, MUTED, TEXT } from "./tokens";

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", to: "#features" },
      { label: "Showcase", to: "#showcase" },
      { label: "The thesis", to: "#voice" },
      { label: "Customers", to: "#customers" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", to: "/login" },
      { label: "Create account", to: "/register" },
    ],
  },
  {
    title: "Run it",
    links: [
      { label: "Quick start", to: "/#top" },
      { label: "Demo login", to: "/login" },
      { label: "Tech stack", to: "/#features" },
    ],
  },
];

export function LandingFooter() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    initGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".cta-card",
          { y: 48, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    if (to.startsWith("#")) {
      e.preventDefault();
      const el = document.getElementById(to.slice(1));
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer ref={root} className="relative overflow-hidden" style={{ background: INK }}>
      {/* final CTA */}
      <div className="mx-auto w-full max-w-6xl px-6 pb-28 pt-8">
        <div
          className="cta-card relative overflow-hidden rounded-3xl border px-6 py-20 text-center md:py-28"
          style={{ borderColor: LINE, background: "rgba(255,255,255,0.03)" }}
        >
          <div
            className="pointer-events-none absolute left-1/2 top-[-40%] h-[420px] w-[720px] -translate-x-1/2 rounded-full blur-[130px]"
            style={{ background: ACCENT_SOFT }}
            aria-hidden
          />
          <div className="relative z-10">
            <span
              className="mx-auto flex size-12 items-center justify-center rounded-2xl"
              style={{ background: ACCENT_SOFT, color: ACCENT }}
            >
              <KanbanSquare className="size-6" />
            </span>
            <h2
              className="mx-auto mt-6 max-w-2xl text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.03em]"
              style={{ color: TEXT }}
            >
              Make the roadmap visible.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed" style={{ color: MUTED }}>
              A workspace is one minute away. Boards, sprints and analytics — free to start,
              no credit card.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/register"
                className="group flex h-12 items-center gap-2 rounded-xl px-7 text-[15px] font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
                style={{ background: ACCENT, boxShadow: `0 16px 44px -16px ${ACCENT_SOFT}` }}
              >
                Start free <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/login"
                className="flex h-12 items-center rounded-xl border px-7 text-[15px] font-semibold transition-colors hover:bg-white/5"
                style={{ color: TEXT, borderColor: LINE }}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* footer grid */}
      <div className="border-t" style={{ borderColor: LINE }}>
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link to="/login" className="flex w-fit items-center gap-2.5">
              <span
                className="flex size-8 items-center justify-center rounded-[10px] text-[12px] font-bold text-white"
                style={{ background: ACCENT }}
              >
                PF
              </span>
              <span className="text-[15px] font-semibold tracking-tight" style={{ color: TEXT }}>
                ProjectFlow
              </span>
            </Link>
            <p className="mt-4 max-w-[24ch] text-[13px] leading-relaxed" style={{ color: FAINT }}>
              A real-time workspace for the teams that ship.
            </p>
          </div>
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: FAINT }}>
                {c.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.to}
                      onClick={(e) => go(e, l.to)}
                      className="text-[13px] transition-colors hover:text-white"
                      style={{ color: MUTED }}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between border-t px-6 py-6" style={{ borderColor: LINE }}>
          <p className="text-[12px]" style={{ color: FAINT }}>
            © {new Date().getFullYear()} ProjectFlow · Plan the work, ship the product.
          </p>
          <p className="hidden font-mono text-[12px] sm:block" style={{ color: FAINT }}>
            ⌘ Boards · Sprints · Analytics
          </p>
        </div>
      </div>
    </footer>
  );
}