"use client";

import { AnimatedSection } from "./AnimatedSection";

const FEATURES = [
  {
    title: "Brand Engine",
    description:
      "Train Lumavi on your exact brand DNA — logos, colors, typography, tone of voice, and visual style.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      </svg>
    ),
    accent: "#6354ff",
    large: true,
  },
  {
    title: "AI Image Generation",
    description:
      "Produce photorealistic or stylized imagery from text prompts, always aligned to your brand guidelines.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="8.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    accent: "#a855f7",
    large: true,
  },
  {
    title: "AI Video Generation",
    description:
      "Transform ideas into short-form video content with control over pacing, transitions, and visual style.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="15" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M17 9l5-3v12l-5-3V9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    accent: "#00d4aa",
    large: false,
  },
  {
    title: "AI Storyboarding",
    description:
      "Write campaign narratives, break them into scenes, generate per-scene visuals, and assemble cohesive campaigns.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    accent: "#f5a623",
    large: false,
  },
  {
    title: "AI Copywriting",
    description:
      "Headlines, captions, ad copy, voiceover scripts — all guided by your brand voice profile.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M4 7h16M4 12h10M4 17h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    accent: "#ec4899",
    large: false,
  },
  {
    title: "Direct Publishing",
    description:
      "Export to any social channel, ad platform, or CMS in the optimal format and resolution. No more manual resizing.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    accent: "#06b6d4",
    large: false,
  },
];

export function PlatformOverview() {
  return (
    <AnimatedSection
      className="landing-section"
      id="features"
      direction="up"
      stagger={0.1}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, #06091a 0%, #0d1035 50%, #06091a 100%)",
        }}
      />
      <div className="relative z-10 max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16" data-animate>
          <span className="font-[var(--font-jetbrains-mono)] text-xs tracking-[0.2em] text-[var(--landing-accent-primary)] uppercase block mb-4">
            The Creation Engine
          </span>
          <h2 className="font-[var(--font-syne)] text-4xl md:text-5xl font-bold text-[var(--landing-text-primary)] mb-4">
            Everything you need. Nothing you don&apos;t.
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              data-animate
              className={`glass-card p-7 group hover:scale-[1.02] transition-all duration-300 ${
                feature.large ? "lg:col-span-1 lg:row-span-1" : ""
              } ${i === 0 ? "md:col-span-2 lg:col-span-1" : ""}`}
            >
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `${feature.accent}18`,
                  color: feature.accent,
                }}
              >
                {feature.icon}
              </div>
              <h3 className="font-[var(--font-syne)] text-lg font-bold text-[var(--landing-text-primary)] mb-2">
                {feature.title}
              </h3>
              <p className="text-[var(--landing-text-secondary)] text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
