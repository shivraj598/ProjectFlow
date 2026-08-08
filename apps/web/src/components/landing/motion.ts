import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

export { gsap, ScrollTrigger, ScrollToPlugin };

export function initGsap() {
  if (gsap.core.globals().ScrollTrigger) return gsap;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });
  return gsap;
}

/** prefers-reduced-motion + small screens gate so scroll hijacks never hurt. */
export function motionEnabled() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches &&
    window.matchMedia("(min-width: 768px)").matches
  );
}

export const EASE = "power3.out";

/** Scroll a section into view with GSAP ScrollTo (smooth nav). */
export function smoothScrollTo(target: string | HTMLElement) {
  initGsap();
  gsap.to(window, {
    scrollTo: { y: typeof target === "string" ? target : target.offsetTop, autoKill: true },
    duration: 1.1,
    ease: "power3.inOut",
    overwrite: "auto",
  });
}