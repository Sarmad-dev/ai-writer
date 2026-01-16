import { Suspense } from "react";
import { SponsorsSection } from "./sponsor/SponsorsSection";
import { FeaturesSection } from "./features/FeaturesSection";
import { TestimonialsSection } from "./testimonials/TestimonialsSection";
import { SiteHeader } from "./header/site-header";
import { HeroSection } from "./hero/hero-section";
import { PricingSection } from "./pricing/pricing-section";
import { CallToAction } from "./cta/cta";
import { Footer } from "./footer/footer";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50/60 via-background to-purple-50/60 dark:from-gray-900 dark:via-background dark:to-indigo-950">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading amazing content...</p>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen relative">
        <Suspense fallback={<LoadingFallback />}>
          <HeroSection />
          <SponsorsSection />
          <section id="features">
            <FeaturesSection />
          </section>
          <section id="testimonials">
            <TestimonialsSection />
          </section>
          <section id="pricing">
            <PricingSection />
          </section>
          <CallToAction />
          <div className="mt-10">
            <Footer />
          </div>
        </Suspense>
      </main>
    </>
  );
}
