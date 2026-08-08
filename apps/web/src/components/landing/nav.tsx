import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { gsap, initGsap, smoothScrollTo } from "./motion";
import { ACCENT, ACCENT_SOFT, LINE, RAISED, TEXT, MUTED } from "./tokens";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#showcase", label: "Showcase" },
  { href: "#voice", label: "Think" },
  { href: "#customers", label: "Customers" },
];

export function LandingNav() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  // entrance + hide-on-scroll-down behaviour
  useEffect(() => {
    initGsap();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ref.current,
          { y: -24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.15 }
        );
        let last = 0;
        const stepper = () => {
          const y = window.scrollY;
          const dir = y > last ? -1 : 1;
          gsap.to(ref.current, {
            y: dir === -1 && y > 120 ? -Math.min(96, y * 0.35) : 0,
            opacity: dir === -1 && y > 120 ? 0.92 : 1,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
          last = y;
        };
        window.addEventListener("scroll", stepper, { passive: true });
        return () => window.removeEventListener("scroll", stepper);
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      setOpen(false);
      smoothScrollTo(href);
    }
  };

  return (
    <header>
      <nav
        ref={ref}
        aria-label="Main"
        className="fixed inset-x-0 top-3 z-50 mx-auto flex h-14 w-[min(100%-24px,1100px)] items-center gap-2 rounded-2xl border px-3 pl-4 backdrop-blur-xl *:backdrop-blur-xl"
        style={{ borderColor: LINE, background: "rgba(10,13,18,0.72)", boxShadow: "0 12px 40px -20px rgba(0,0,0,0.7)" }}
      >
        {/* brand */}
        <a href="#top" onClick={(e) => go(e, "#top")} className="flex items-center gap-2.5">
          <span
            className="flex size-8 items-center justify-center rounded-[10px] text-[12px] font-bold text-white"
            style={{ background: ACCENT, boxShadow: `0 6px 18px -6px ${ACCENT_SOFT}` }}
          >
            PF
          </span>
          <span className="text-[15px] font-semibold tracking-tight" style={{ color: TEXT }}>
            ProjectFlow
          </span>
        </a>

        {/* center links */}
        <div className="mx-auto hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => go(e, l.href)}
              className="rounded-lg px-3 py-2 text-[13px] font-medium transition-colors hover:text-white"
              style={{ color: MUTED }}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* actions */}
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            to="/login"
            className="hidden rounded-lg px-3 py-2 text-[13px] font-medium transition-colors hover:text-white sm:block"
            style={{ color: MUTED }}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
            style={{ background: ACCENT, boxShadow: `0 8px 24px -10px ${ACCENT_SOFT}` }}
          >
            Get started <ArrowRight className="size-3.5" />
          </Link>
          <button
            className="flex size-9 items-center justify-center rounded-lg text-white/80 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{ borderColor: LINE }}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {/* mobile sheet */}
      {open && (
        <div
          className="fixed inset-x-3 top-[70px] z-40 rounded-2xl border p-2 md:hidden"
          style={{ borderColor: LINE, background: RAISED }}
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => go(e, l.href)}
              className="block rounded-lg px-4 py-3 text-[14px] font-medium"
              style={{ color: TEXT }}
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/login"
            className="block rounded-lg px-4 py-3 text-[14px] font-medium"
            style={{ color: MUTED }}
          >
            Sign in
          </Link>
        </div>
      )}
    </header>
  );
}