import { LandingNav } from "@/components/landing/nav";
import { LandingHero } from "@/components/landing/hero";
import { LandingBento } from "@/components/landing/bento";
import { LandingShowcase } from "@/components/landing/showcase";
import { LandingVoice } from "@/components/landing/voice";
import { LandingTestimonials } from "@/components/landing/testimonials";
import { LandingFooter } from "@/components/landing/footer";

const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E";

export function LandingPage() {
  return (
    <main className="relative w-full max-w-full overflow-x-hidden bg-[#0a0d12] text-[#e8ebf0] antialiased">
      {/* film grain — fixed, pointer-events-none, never on a scrolling container */}
      <div
        className="pointer-events-none fixed inset-0 z-[60] opacity-[0.028]"
        style={{ backgroundImage: `url("${GRAIN}")` }}
        aria-hidden
      />
      <LandingNav />
      <LandingHero />
      <LandingBento />
      <LandingShowcase />
      <LandingVoice />
      <LandingTestimonials />
      <LandingFooter />
    </main>
  );
}