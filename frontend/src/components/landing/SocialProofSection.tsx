"use client";

import { AnimatedSection } from "./AnimatedSection";

const PERSONAS = [
  {
    title: "Brand Marketer",
    value: "Full campaign production in hours, not weeks",
    accent: "#1e3a5f",
    border: "#3b82f6",
  },
  {
    title: "Creative Director",
    value: "Brand consistency enforced automatically across every asset",
    accent: "#2d1b4e",
    border: "#a855f7",
  },
  {
    title: "Performance Marketer",
    value: "Direct path from creative to published ad with performance feedback",
    accent: "#3d2b0f",
    border: "#f5a623",
  },
  {
    title: "Agency Producer",
    value: "Multi-client production at scale from one platform",
    accent: "#0b3d2e",
    border: "#00d4aa",
  },
  {
    title: "Content Creator",
    value: "Professional output without professional design skills",
    accent: "#3d0f2b",
    border: "#ec4899",
  },
];

export function SocialProofSection() {
  return (
    <AnimatedSection
      className="landing-section"
      direction="up"
      stagger={0.1}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, #06091a 0%, #0a0e28 50%, #06091a 100%)",
        }}
      />
      <div className="relative z-10 max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16" data-animate>
          <h2 className="font-[var(--font-syne)] text-4xl md:text-5xl font-bold text-[var(--landing-text-primary)] mb-4">
            Built for every creative team.
          </h2>
          <p className="text-lg text-[var(--landing-text-secondary)] max-w-xl mx-auto">
            From solo creators to enterprise agencies, Lumavi adapts to your
            workflow.
          </p>
        </div>

        {/* Persona cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PERSONAS.map((persona, i) => (
            <div
              key={i}
              data-animate
              className={`glass-card p-6 group hover:scale-[1.02] transition-all duration-300 ${
                i === PERSONAS.length - 1
                  ? "sm:col-span-2 lg:col-span-1"
                  : ""
              }`}
              style={{
                borderColor: `${persona.border}30`,
              }}
            >
              {/* Accent dot */}
              <div
                className="w-3 h-3 rounded-full mb-5"
                style={{ background: persona.border }}
              />
              <h3 className="font-[var(--font-syne)] text-lg font-bold text-[var(--landing-text-primary)] mb-2">
                {persona.title}
              </h3>
              <p className="text-[var(--landing-text-secondary)] text-sm leading-relaxed">
                {persona.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
