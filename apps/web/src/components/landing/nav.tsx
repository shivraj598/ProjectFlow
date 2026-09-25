import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { gsap, initGsap, smoothScrollTo } from "./motion";
import { ACCENT, FAINT, INK, LINE, MUTED, ON_ACCENT, TEXT } from "./tokens";
import { cn } from "./tokens";

const LINKS = [
  { href: "#features", label: "Product", idx: "01" },
  { href: "#showcase", label: "Showcase", idx: "02" },
  { href: "#voice", label: "Thesis", idx: "03" },
  { href: "#customers", label: "Customers", idx: "04" },
];

/* Landing black ↔ white mode. Persists; defaults to black. */
function useLandingTheme() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("projectflow-landing-theme");
    const initial = stored ? stored === "light" : false;
    setLight(initial);
    document.documentElement.classList.toggle("landing-light", initial);
  }, []);
  const toggle = () => {
    setLight((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("landing-light", next);
      localStorage.setItem("projectflow-landing-theme", next ? "light" : "dark");
      return next;
    });
  };
  return { light, toggle };
}

export function LandingNav() {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const { light, toggle } = useLandingTheme();

  useEffect(() => {
    initGsap();
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ref.current,
          { y: -36, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.15 }
        );
      });
    }, ref);
    return () => {
      ctx.revert();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* scroll spy — highlights the section you're reading */
  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      setOpen(false);
      smoothScrollTo(href);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav
        ref={ref}
        aria-label="Main"
        className={cn(
          "mx-auto flex h-14 w-full max-w-6xl items-center gap-3 rounded-2xl border px-3 transition-all duration-300 sm:px-4",
          scrolled
            ? "shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl"
            : "backdrop-blur-md"
        )}
        style={{
          borderColor: LINE,
          background: "color-mix(in srgb, var(--ld-ink) 78%, transparent)",
        }}
      >
        {/* brand */}
        <a href="#top" onClick={(e) => go(e, "#top")} className="group flex items-center gap-2.5" aria-label="ProjectFlow home">
          <span
            className="relative flex size-8 items-center justify-center rounded-lg text-[11px] font-extrabold tracking-tight transition-transform duration-300 group-hover:scale-105"
            style={{ background: ACCENT, color: ON_ACCENT }}
          >
            PF
            <span
              className="absolute -right-1 -top-1 size-2 rounded-full border-2"
              style={{ background: ACCENT, borderColor: INK }}
              aria-hidden
            />
          </span>
          <span className="hidden flex-col leading-none xs:flex sm:flex">
            <span className="text-[14px] font-extrabold tracking-[-0.02em]" style={{ color: TEXT }}>
              ProjectFlow
            </span>
            <span className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.22em]" style={{ color: FAINT }}>
              Realtime workspace
            </span>
          </span>
        </a>

        {/* center links */}
        <div
          className="mx-auto hidden items-center gap-1 rounded-full border p-1 md:flex"
          style={{ borderColor: LINE, background: "color-mix(in srgb, var(--ld-accent) 4%, transparent)" }}
        >
          {LINKS.map((l) => {
            const on = active === l.href;
            return (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => go(e, l.href)}
                aria-current={on ? "true" : undefined}
                className="relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200"
                style={{
                  color: on ? ON_ACCENT : MUTED,
                  background: on ? ACCENT : "transparent",
                }}
              >
                <span className="font-mono text-[9px] tracking-[0.14em]" style={{ color: on ? ON_ACCENT : FAINT, opacity: on ? 0.7 : 1 }}>
                  {l.idx}
                </span>
                {l.label}
              </a>
            );
          })}
        </div>

        {/* actions */}
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeToggle light={light} onToggle={toggle} />

          <span aria-hidden className="hidden h-5 w-px sm:block" style={{ background: LINE }} />

          <Link
            to="/login"
            className="hidden rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors sm:block"
            style={{ color: MUTED }}
            onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)}
            onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="group hidden items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5 text-[13px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] sm:flex"
            style={{ background: ACCENT, color: ON_ACCENT }}
          >
            Start free
            <span
              className="flex size-7 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5"
              style={{ background: ON_ACCENT, color: ACCENT }}
            >
              <ArrowRight className="size-3.5" />
            </span>
          </Link>

          {/* mobile hamburger */}
          <button
            className="flex size-9 items-center justify-center rounded-xl border md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{ borderColor: LINE, color: TEXT }}
          >
            <span className="relative block h-3 w-4">
              <span
                className="absolute left-0 top-0 h-px w-full bg-current transition-all duration-300"
                style={{ transform: open ? "translateY(5.5px) rotate(45deg)" : "none" }}
              />
              <span
                className="absolute left-0 top-[5.5px] h-px w-full bg-current transition-all duration-300"
                style={{ opacity: open ? 0 : 1 }}
              />
              <span
                className="absolute bottom-0 left-0 h-px w-full bg-current transition-all duration-300"
                style={{ transform: open ? "translateY(-5.5px) rotate(-45deg)" : "none" }}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* mobile sheet */}
      <div
        className={cn(
          "mx-auto grid max-w-6xl transition-all duration-300 md:hidden",
          open ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="rounded-2xl border p-2 backdrop-blur-xl" style={{ borderColor: LINE, background: "color-mix(in srgb, var(--ld-ink) 88%, transparent)" }}>
            <p className="flex items-center justify-between px-4 py-2 font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: FAINT }}>
              Index
              <span>[ NAV ]</span>
            </p>
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => go(e, l.href)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium transition-colors"
                style={{ color: active === l.href ? TEXT : MUTED, background: active === l.href ? "color-mix(in srgb, var(--ld-accent) 7%, transparent)" : "transparent" }}
              >
                <span className="font-mono text-[9px] tracking-[0.14em]" style={{ color: FAINT }}>
                  {l.idx}
                </span>
                {l.label}
                <ArrowRight className="ml-auto size-3.5" style={{ color: FAINT }} />
              </a>
            ))}
            <div className="mt-1 flex items-center gap-2 border-t p-2" style={{ borderColor: LINE }}>
              <Link
                to="/login"
                className="flex-1 rounded-xl px-4 py-2.5 text-center text-[13px] font-medium"
                style={{ color: MUTED }}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="flex-1 rounded-xl px-4 py-2.5 text-center text-[13px] font-semibold"
                style={{ background: ACCENT, color: ON_ACCENT }}
              >
                Start free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* Segmented black ↔ white switch */
function ThemeToggle({ light, onToggle }: { light: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={light}
      aria-label={light ? "Switch to black mode" : "Switch to white mode"}
      title={light ? "Switch to black mode" : "Switch to white mode"}
      onClick={onToggle}
      className="relative flex h-9 w-[68px] shrink-0 items-center rounded-full border px-1 transition-colors duration-300"
      style={{ borderColor: LINE, background: "color-mix(in srgb, var(--ld-accent) 5%, transparent)" }}
    >
      <span
        aria-hidden
        className="absolute top-1 size-7 rounded-full transition-all duration-300"
        style={{
          background: ACCENT,
          left: light ? "calc(100% - 2rem)" : "0.25rem",
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        }}
      />
      <span className="relative z-10 flex w-full items-center justify-between px-1.5">
        <Sun
          className="size-4 transition-colors duration-300"
          style={{ color: light ? ON_ACCENT : FAINT }}
        />
        <Moon
          className="size-4 transition-colors duration-300"
          style={{ color: light ? FAINT : TEXT }}
        />
      </span>
    </button>
  );
}
