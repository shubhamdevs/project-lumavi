"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsapConfig";
import { prefersReducedMotion } from "@/lib/gsapConfig";

const STEPS = [
  {
    number: "01",
    title: "Teach your brand",
    description:
      "Upload your logo, define your colors, set your tone. Lumavi extracts brand signals automatically using AI.",
    accent: "var(--landing-accent-primary)",
  },
  {
    number: "02",
    title: "Create at the speed of thought",
    description:
      "Describe what you need in plain language. Get production-ready images, videos, and copy that never miss the mark.",
    accent: "var(--landing-accent-secondary)",
  },
  {
    number: "03",
    title: "Publish everywhere",
    description:
      "Export directly to Instagram, Google Ads, TikTok, your CMS — in every format, every resolution, every platform.",
    accent: "var(--landing-accent-warm)",
  },
];

export function WorkflowSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Animate the timeline line drawing
      const line = sectionRef.current?.querySelector("[data-timeline-line]");
      if (line) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 1.2,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Stagger step cards
      gsap.from("[data-step-card]", {
        x: (i: number) => (i % 2 === 0 ? -60 : 60),
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="workflow"
      className="landing-section"
      style={{ background: "var(--landing-bg)" }}
    >
      <div className="relative z-10 max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="font-[var(--font-jetbrains-mono)] text-xs tracking-[0.2em] text-[var(--landing-accent-secondary)] uppercase block mb-4">
            How It Works
          </span>
          <h2 className="font-[var(--font-syne)] text-4xl md:text-5xl font-bold text-[var(--landing-text-primary)]">
            Three steps.{" "}
            <span className="text-gradient-hero">Infinite creative output.</span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative max-w-2xl mx-auto">
          {/* Vertical line */}
          <div
            data-timeline-line
            className="absolute left-6 md:left-8 top-0 bottom-0 w-px origin-top"
            style={{
              background:
                "linear-gradient(180deg, var(--landing-accent-primary), var(--landing-accent-secondary), var(--landing-accent-warm))",
            }}
          />

          {/* Steps */}
          <div className="space-y-12 md:space-y-16">
            {STEPS.map((step, i) => (
              <div
                key={i}
                data-step-card
                className="relative flex items-start gap-6 md:gap-8 pl-0"
              >
                {/* Number badge */}
                <div
                  className="relative z-10 flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-[var(--font-syne)] font-bold text-sm md:text-lg"
                  style={{
                    background: `color-mix(in srgb, ${step.accent} 15%, var(--landing-bg))`,
                    border: `2px solid color-mix(in srgb, ${step.accent} 40%, transparent)`,
                    color: step.accent,
                  }}
                >
                  {step.number}
                </div>

                {/* Content card */}
                <div className="glass-card p-6 md:p-8 flex-1">
                  <h3 className="font-[var(--font-syne)] text-xl md:text-2xl font-bold text-[var(--landing-text-primary)] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[var(--landing-text-secondary)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
