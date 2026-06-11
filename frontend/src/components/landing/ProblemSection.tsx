"use client";

import { AnimatedSection } from "./AnimatedSection";

const VALUE_PILLARS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M4 14l7 7L24 7"
          stroke="url(#speed-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 4v4M14 20v4M4 14h4M20 14h4"
          stroke="url(#speed-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <defs>
          <linearGradient id="speed-grad" x1="4" y1="4" x2="24" y2="24">
            <stop stopColor="#6354ff" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
    ),
    title: "Brief to asset in seconds.",
    description:
      "What used to take your agency two weeks now happens in a single prompt. Generate campaign-ready images, videos, and copy instantly.",
    accent: "var(--landing-accent-primary)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect
          x="4"
          y="4"
          width="20"
          height="20"
          rx="4"
          stroke="url(#brand-grad)"
          strokeWidth="2"
        />
        <circle cx="14" cy="14" r="4" stroke="url(#brand-grad)" strokeWidth="2" />
        <path
          d="M14 4v4M14 20v4M4 14h4M20 14h4"
          stroke="url(#brand-grad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="brand-grad" x1="4" y1="4" x2="24" y2="24">
            <stop stopColor="#00d4aa" />
            <stop offset="1" stopColor="#00b894" />
          </linearGradient>
        </defs>
      </svg>
    ),
    title: "Every asset. On brand. Always.",
    description:
      "Your brand guidelines aren't a suggestion — they're the engine. Lumavi enforces your colors, typography, tone, and visual style across every single generation.",
    accent: "var(--landing-accent-secondary)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M4 22L10 16L14 20L24 8"
          stroke="url(#intel-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="24"
          cy="8"
          r="3"
          fill="none"
          stroke="url(#intel-grad)"
          strokeWidth="2"
        />
        <defs>
          <linearGradient id="intel-grad" x1="4" y1="22" x2="24" y2="8">
            <stop stopColor="#f5a623" />
            <stop offset="1" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
    ),
    title: "The longer you use it, the smarter it gets.",
    description:
      "Past performance, creative patterns, and audience responses feed back into future generations. Your Lumavi after one year is fundamentally more powerful than day one.",
    accent: "var(--landing-accent-warm)",
  },
];

export function ProblemSection() {
  return (
    <AnimatedSection className="landing-section" direction="up" stagger={0.15}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--landing-bg)" }}
      />
      <div className="relative z-10 max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="max-w-3xl mb-16" data-animate>
          <h2 className="font-[var(--font-syne)] text-4xl md:text-5xl font-bold text-[var(--landing-text-primary)] mb-6 leading-tight">
            Your creative team is the bottleneck.
            <br />
            <span className="text-gradient-hero">
              It doesn&apos;t have to be.
            </span>
          </h2>
          <p className="text-lg text-[var(--landing-text-secondary)] leading-relaxed">
            Traditional content production is slow, expensive, and inconsistent.
            Lumavi removes every bottleneck.
          </p>
        </div>

        {/* Value pillar cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {VALUE_PILLARS.map((pillar, i) => (
            <div
              key={i}
              data-animate
              className="glass-card p-8 group hover:scale-[1.02] transition-transform duration-300"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `color-mix(in srgb, ${pillar.accent} 12%, transparent)`,
                }}
              >
                {pillar.icon}
              </div>
              <h3 className="font-[var(--font-syne)] text-xl font-bold text-[var(--landing-text-primary)] mb-3">
                {pillar.title}
              </h3>
              <p className="text-[var(--landing-text-secondary)] text-[15px] leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
