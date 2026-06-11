"use client";

import Link from "next/link";
import { AnimatedSection } from "./AnimatedSection";
import { ParticleBackground } from "./ParticleBackground";

export function CTASection() {
  return (
    <AnimatedSection className="landing-section relative" direction="up">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, #10143a 0%, #06091a 70%)",
        }}
      />
      <ParticleBackground particleCount={30} opacity={0.25} />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2
          data-animate
          className="font-[var(--font-syne)] text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
        >
          <span className="text-[var(--landing-text-primary)]">
            Your brand deserves better
          </span>
          <br />
          <span className="text-gradient-hero">than generic AI.</span>
        </h2>
        <p
          data-animate
          className="text-lg text-[var(--landing-text-secondary)] mb-10 max-w-xl mx-auto leading-relaxed"
        >
          Join the teams using Lumavi to create campaign-ready content in
          seconds, not weeks.
        </p>
        <div
          data-animate
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="btn-landing-primary w-full sm:w-auto glow-primary"
          >
            Start creating for free
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="ml-1"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <a
            href="mailto:hello@lumavi.ai"
            className="btn-landing-secondary w-full sm:w-auto"
          >
            Talk to our team
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="ml-1"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </AnimatedSection>
  );
}
