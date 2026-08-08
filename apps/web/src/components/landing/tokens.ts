/**
 * Landing / auth pages are a locked dark brand world (the app itself is
 * dark-first). These tokens are used instead of the app's theme variables so
 * the marketing surface never flashes light.
 */
export const INK = "#0a0d12"; // page background
export const RAISED = "#11151d"; // elevated surfaces
export const RAISED_2 = "#161b25"; // cards / panels
export const LINE = "rgba(255,255,255,0.08)"; // hairlines
export const TEXT = "#e8ebf0"; // primary text
export const MUTED = "#9aa4b3"; // secondary text
export const FAINT = "#5d6775"; // tertiary
export const ACCENT = "#6b9dff"; // single brand accent (app primary in dark)
export const ACCENT_SOFT = "rgba(107,157,255,0.12)";

export const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");