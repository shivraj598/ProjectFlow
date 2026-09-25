import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { ACCENT, FAINT, INK, LINE, LINE_SOFT, MUTED, ON_ACCENT, PANEL, TEXT } from "./landing/tokens";
import { LandingThemeToggle } from "./landing/theme-toggle";
import "./landing/landing-theme.css";

export function AuthShell({
  badge,
  title,
  subtitle,
  children,
  footer,
}: {
  badge: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="landing-root relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10" style={{ background: INK, color: TEXT }}>
      {/* blueprint grid + radiance */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(80% 70% at 50% 30%, black 4%, transparent 72%)",
            WebkitMaskImage: "radial-gradient(80% 70% at 50% 30%, black 4%, transparent 72%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 40% at 50% 0%, rgba(255,255,255,0.05), transparent 62%)",
          }}
        />
      </div>

      {/* ghost wordmark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[26vw] font-extrabold leading-none tracking-[-0.05em] opacity-[0.035]"
        style={{ WebkitTextStroke: "1px var(--ld-accent)", color: "transparent" }}
      >
        FLOW
      </div>

      <div className="fade-up relative z-10 w-full max-w-[420px]">
        {/* top bar — back + theme */}
        <div className="mb-6 flex items-center justify-between">
          <BackButton />
          <LandingThemeToggle />
        </div>

        {/* brand */}
        <Link to="/" className="group mb-6 flex items-center justify-center gap-2.5" aria-label="Back to home">
          <span
            className="flex size-8 items-center justify-center rounded-lg text-[12px] font-extrabold transition-transform duration-300 group-hover:scale-105"
            style={{ background: ACCENT, color: ON_ACCENT }}
          >
            PF
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-extrabold tracking-[-0.02em]" style={{ color: TEXT }}>
              ProjectFlow
            </span>
            <span className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.22em]" style={{ color: FAINT }}>
              Realtime workspace
            </span>
          </span>
        </Link>

        {/* form card */}
        <div className="relative overflow-hidden rounded-2xl border shadow-[0_40px_120px_rgba(0,0,0,0.35)]" style={{ borderColor: LINE, background: PANEL }}>
          <span
            aria-hidden
            className="absolute inset-x-8 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, var(--ld-accent), transparent)", opacity: 0.6 }}
          />
          {/* card header */}
          <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: LINE_SOFT }}>
            <div className="flex items-center gap-2.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--ld-accent)] opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-[var(--ld-accent)]" />
              </span>
              <span className="text-[12.5px] font-semibold" style={{ color: TEXT }}>
                Access console
              </span>
            </div>
            <span className="rounded-full border px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ borderColor: LINE_SOFT, color: FAINT }}>
              [ AUTH / {badge} ]
            </span>
          </div>

          <div className="px-6 py-7">
            <h1 className="text-[24px] font-extrabold uppercase leading-none tracking-[-0.02em]" style={{ color: TEXT }}>
              {title}
            </h1>
            <p className="mt-2 font-mono text-[11px] tracking-[0.02em]" style={{ color: FAINT }}>
              {subtitle}
            </p>
            {children}
          </div>
        </div>

        <div className="mt-5 text-center text-[13px]" style={{ color: MUTED }}>
          {footer}
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em]" style={{ color: FAINT }}>
          <Lock className="size-3" /> Encrypted sessions · JWT rotation
        </p>
      </div>
    </div>
  );
}

/* Back arrow — history back with home fallback */
export function BackButton() {
  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };
  return (
    <button
      type="button"
      onClick={goBack}
      className="group flex items-center gap-2 rounded-full border py-2 pl-2.5 pr-4 text-[13px] font-medium backdrop-blur-md transition-colors hover:bg-[var(--ld-accent-soft)]"
      style={{ borderColor: LINE, color: MUTED }}
      aria-label="Go back"
    >
      <span
        className="flex size-6 items-center justify-center rounded-full transition-transform duration-300 group-hover:-translate-x-0.5"
        style={{ background: ACCENT, color: ON_ACCENT }}
      >
        <ArrowLeft className="size-3.5" />
      </span>
      Back
    </button>
  );
}

export function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  autoFocus,
  icon,
  toggleVisibility,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  icon?: React.ReactNode;
  toggleVisibility?: boolean;
}) {
  const [show, setShow] = useState(false);
  const inputType = toggleVisibility && show ? "text" : type;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: FAINT }}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: FAINT }}>
            {icon}
          </span>
        )}
        <input
          id={id}
          type={inputType}
          required
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          autoCapitalize={type === "email" ? "none" : undefined}
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border bg-[var(--ld-ink)] text-[14px] text-[var(--ld-text)] outline-none transition-all placeholder:text-[var(--ld-faint)] focus:border-[var(--ld-line)] focus:ring-4 focus:ring-[var(--ld-accent-soft)]"
          style={{
            borderColor: LINE_SOFT,
            paddingLeft: icon ? "2.6rem" : "0.9rem",
            paddingRight: toggleVisibility ? "2.6rem" : "0.9rem",
          }}
        />
        {toggleVisibility && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg transition-colors hover:bg-[var(--ld-accent-soft)]"
            style={{ color: FAINT }}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
