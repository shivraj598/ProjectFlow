import { LandingNav } from "@/components/landing/nav";
import { LandingHero } from "@/components/landing/hero";
import { LandingCapabilities } from "@/components/landing/capabilities";
import { LandingBento } from "@/components/landing/bento";
import { LandingShowcase } from "@/components/landing/showcase";
import { LandingVoice } from "@/components/landing/voice";
import { LandingTestimonials } from "@/components/landing/testimonials";
import { LandingCta } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";
import { GRAIN } from "@/components/landing/tokens";

export function LandingPage() {
  return (
    <main className="relative w-full max-w-full overflow-x-hidden bg-black text-white antialiased">
      {/* film grain — fixed, pointer-events-none, never on a scrolling container */}
      <div
        className="pointer-events-none fixed inset-0 z-[60] opacity-[0.035]"
        style={{ backgroundImage: `url("${GRAIN}")` }}
        aria-hidden
      />
      <LandingNav />
      <LandingHero />
      <LandingCapabilities />
      <LandingBento />
      <LandingShowcase />
      <LandingVoice />
      <LandingTestimonials />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}