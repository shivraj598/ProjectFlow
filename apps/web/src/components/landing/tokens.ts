/**
 * Landing theme tokens — CSS-variable backed so the landing page
 * can flip between black and white mode without re-rendering.
 * Dark is the default; `html.landing-light` overrides (see landing-theme.css).
 */
export const INK = "var(--ld-ink)"; // page background
export const PANEL = "var(--ld-panel)"; // elevated panels
export const PANEL_2 = "var(--ld-panel-2)"; // nested cells
export const PANEL_3 = "var(--ld-panel-3)"; // deepest hover
export const LINE = "var(--ld-line)"; // structural hairlines
export const LINE_SOFT = "var(--ld-line-soft)"; // fainter dividers
export const TEXT = "var(--ld-text)"; // primary text
export const MUTED = "var(--ld-muted)"; // secondary text
export const FAINT = "var(--ld-faint)"; // tertiary / label
export const ACCENT = "var(--ld-accent)"; // inverted blocks — the accent IS the inversion
export const ACCENT_SOFT = "var(--ld-accent-soft)"; // tinted fills
export const ON_ACCENT = "var(--ld-on-accent)"; // text on top of ACCENT
export const OK = "var(--ld-accent)"; // semantic success collapses into accent
export const WARN = "var(--ld-muted)"; // semantic warning collapses to muted

export const GRAIN = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E`;

export const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");
