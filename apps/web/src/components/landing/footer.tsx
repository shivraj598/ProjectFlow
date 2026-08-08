import { Link } from "react-router";
import { ACCENT, FAINT, INK, LINE, MUTED, TEXT } from "./tokens";

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
  const go = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    if (to.startsWith("#")) {
      e.preventDefault();
      const el = document.getElementById(to.slice(1));
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="relative overflow-hidden" style={{ background: INK }}>
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