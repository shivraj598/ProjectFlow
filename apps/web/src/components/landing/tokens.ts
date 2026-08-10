/**
 * Landing / auth pages — black & white theme.
 * Pure monochrome: black surfaces, white ink, hairlines, inverted white blocks.
 */
export const INK = "#000000"; // page background
export const PANEL = "#0a0a0a"; // elevated panels
export const PANEL_2 = "#111111"; // nested cells
export const PANEL_3 = "#1a1a1a"; // deepest hover
export const LINE = "rgba(255,255,255,0.14)"; // structural hairlines
export const LINE_SOFT = "rgba(255,255,255,0.07)"; // fainter dividers
export const TEXT = "#ffffff"; // primary text
export const MUTED = "#a3a3a3"; // secondary text
export const FAINT = "#666666"; // tertiary / label
export const ACCENT = "#ffffff"; // inverted blocks — the accent IS the inversion
export const ACCENT_SOFT = "rgba(255,255,255,0.10)"; // tinted white fills
export const OK = "#ffffff"; // semantic success collapses into white
export const WARN = "#a3a3a3"; // semantic warning collapses to muted

export const GRAIN = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E`;

export const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");