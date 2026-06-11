"use client";

import "../app/landing-animations.css";
import { SmoothScrollProvider } from "./landing/SmoothScrollProvider";
import { NavBar } from "./landing/NavBar";
import { HeroSection } from "./landing/HeroSection";
import { ComparisonSection } from "./landing/ComparisonSection";
import { ProblemSection } from "./landing/ProblemSection";
import { PlatformOverview } from "./landing/PlatformOverview";
import { WorkflowSection } from "./landing/WorkflowSection";
import { SocialProofSection } from "./landing/SocialProofSection";
import { PricingSection } from "./landing/PricingSection";
import { CTASection } from "./landing/CTASection";
import { Footer } from "./landing/Footer";

export function LandingPageClient() {
  return (
    <SmoothScrollProvider>
      <div
        className="min-h-screen antialiased"
        style={{
          background: "var(--landing-bg)",
          color: "var(--landing-text-primary)",
        }}
      >
        <NavBar />
        <main>
          <HeroSection />
          <ComparisonSection />
          <ProblemSection />
          <PlatformOverview />
          <WorkflowSection />
          <SocialProofSection />
          <PricingSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}
