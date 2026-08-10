import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { gsap, initGsap, smoothScrollTo } from "./motion";
import { FAINT, INK, LINE, LINE_SOFT, MUTED, TEXT } from "./tokens";
import { cn } from "./tokens";

const LINKS = [
  { href: "#features", label: "Product", idx: "01" },
  { href: "#showcase", label: "Showcase", idx: "02" },
  { href: "#voice", label: "Thesis", idx: "03" },
  { href: "#customers", label: "Customers", idx: "04" },
];

export function LandingNav() {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
          "mx-auto flex h-13 w-full max-w-6xl items-center gap-4 border px-4 transition-all duration-300 sm:px-5",
          scrolled
            ? "border-[rgba(255,255,255,0.14)] bg-[#000000] shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
            : "border-[rgba(255,255,255,0.1)] bg-[#050505]/80 backdrop-blur-md"
        )}
      >
        {/* brand */}
        <a href="#top" onClick={(e) => go(e, "#top")} className="group flex items-center gap-3">
          <span className="relative flex h-7 w-7 items-center justify-center border border-[rgba(255,255,255,0.6)]" style={{ background: "transparent" }}>
            <span className="text-[10px] font-bold tracking-[0.05em]" style={{ color: "#ffffff" }}>
              PF
            </span>
            <span className="absolute -right-1 -top-1 size-1 bg-white" aria-hidden />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[14px] font-extrabold tracking-[-0.02em]" style={{ color: TEXT }}>
              ProjectFlow
            </span>
            <span className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.22em]" style={{ color: FAINT }}>
              Realtime workspace
            </span>
          </span>
        </a>

        {/* center links — mono indexes */}
        <div className="mx-auto hidden items-center gap-0.5 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => go(e, l.href)}
              className="group flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium transition-colors hover:text-white"
              style={{ color: MUTED }}
            >
              <span className="font-mono text-[9px] tracking-[0.14em] transition-colors group-hover:text-white" style={{ color: FAINT }}>
                {l.idx}
              </span>
              {l.label}
            </a>
          ))}
        </div>

        {/* actions */}
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            to="/login"
            className="hidden items-center gap-2 rounded-sm px-3.5 py-2 text-[13px] font-medium transition-colors hover:text-white sm:flex"
            style={{ color: MUTED }}
          >
            <span className="font-mono text-[9px] tracking-[0.14em]" style={{ color: FAINT }}>
              &gt;
            </span>
            Sign in
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-2 rounded-sm px-4 py-2 text-[13px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "#ffffff", color: "#000000" }}
          >
            Start free
            <span className="font-mono text-[9px] opacity-70">&rarr;</span>
          </Link>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-sm border md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{ borderColor: LINE, color: TEXT }}
          >
            {open ? (
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <span className="flex flex-col gap-1">
                <span className="h-px w-4 bg-current" />
                <span className="h-px w-4 bg-current" />
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* mobile sheet */}
      {open && (
        <div className="mx-auto mt-px max-w-6xl border px-2 py-2" style={{ borderColor: LINE, background: INK }}>
          <p className="flex items-center justify-between px-4 py-2 font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: FAINT }}>
            Index
            <span>[ NAV ]</span>
          </p>
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => go(e, l.href)}
              className="flex items-center gap-3 rounded-sm px-4 py-3 text-[14px] font-medium transition-colors hover:text-white"
              style={{ color: TEXT, borderBottom: `1px solid ${LINE_SOFT}` }}
            >
              <span className="font-mono text-[9px] tracking-[0.14em]" style={{ color: FAINT }}>
                {l.idx}
              </span>
              {l.label}
            </a>
          ))}
          <Link
            to="/login"
            className="flex items-center gap-3 rounded-sm px-4 py-3 text-[14px] font-medium transition-colors hover:text-white"
            style={{ color: MUTED }}
          >
            <span className="font-mono text-[9px]" style={{ color: FAINT }}>&gt;</span>
            Sign in
          </Link>
        </div>
      )}
    </header>
  );
}