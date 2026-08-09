import { Link } from "react-router";
import { FAINT, INK, LINE, LINE_SOFT, MUTED, PANEL, TEXT } from "./landing/tokens";

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
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4" style={{ background: INK }}>
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
        style={{ WebkitTextStroke: "1px #fff", color: "transparent" }}
      >
        FLOW
      </div>

      <div className="fade-up relative z-10 w-full max-w-sm">
        {/* mono system strip */}
        <Link to="/" className="mb-10 flex items-center justify-between">
          <span className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center border border-[rgba(255,255,255,0.6)] text-[10px] font-bold" style={{ color: "#ffffff" }}>
              PF
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[14px] font-extrabold tracking-[-0.02em]" style={{ color: TEXT }}>
                ProjectFlow
              </span>
              <span className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.22em]" style={{ color: FAINT }}>
                Realtime workspace
              </span>
            </span>
          </span>
          <span className="hidden font-mono text-[9.5px] uppercase tracking-[0.16em] sm:block" style={{ color: FAINT }}>
            [ AUTH / {badge} ]
          </span>
        </Link>

        {/* form sheet */}
        <div className="border" style={{ borderColor: LINE, background: PANEL }}>
          {/* sheet header */}
          <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: LINE_SOFT }}>
            <div className="flex items-center gap-2.5">
              <span className="flex size-6 items-center justify-center rounded-sm text-[9px] font-bold" style={{ background: "#ffffff", color: "#000000" }}>
                PF
              </span>
              <span className="text-[12.5px] font-semibold" style={{ color: TEXT }}>
                Access console
              </span>
            </div>
            <span className="flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ borderColor: LINE_SOFT, color: "#ffffff" }}>
              <span className="size-1.5 rounded-full bg-white" /> {badge}
            </span>
          </div>

          <div className="px-6 py-7">
            <h1 className="text-[22px] font-extrabold uppercase tracking-[-0.02em]" style={{ color: TEXT }}>
              {title}
            </h1>
            <p className="mt-1.5 font-mono text-[11px] tracking-[0.02em]" style={{ color: FAINT }}>
              {subtitle}
            </p>
            {children}
          </div>
        </div>

        <div className="mt-5 text-center text-[13px]" style={{ color: MUTED }}>
          {footer}
        </div>
      </div>
    </div>
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
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: FAINT }}>
        <span className="text-white/40">&gt;</span>
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full border bg-black px-3 text-[14px] text-white outline-none transition-colors placeholder:text-white/25 focus:border-white/60"
        style={{ borderColor: LINE_SOFT }}
      />
    </div>
  );
}