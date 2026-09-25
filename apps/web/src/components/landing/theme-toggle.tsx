import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { ACCENT, FAINT, LINE, ON_ACCENT, TEXT } from "./tokens";

/* Shared landing black ↔ white mode. Persists; defaults to black.
   Flips `html.landing-light`; anything inside `.landing-root`
   re-themes via landing-theme.css. */
export function useLandingTheme() {
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

/* Segmented black ↔ white switch */
export function LandingThemeToggle() {
  const { light, toggle } = useLandingTheme();
  return (
    <button
      role="switch"
      aria-checked={light}
      aria-label={light ? "Switch to black mode" : "Switch to white mode"}
      title={light ? "Switch to black mode" : "Switch to white mode"}
      onClick={toggle}
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
