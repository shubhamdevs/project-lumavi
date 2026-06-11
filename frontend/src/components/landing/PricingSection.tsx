"use client";

import Link from "next/link";
import { AnimatedSection } from "./AnimatedSection";

const CHECK_ICON = (accent: string) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-shrink-0">
    <path d="M3 8l3.5 3.5L13 5" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For solo creators exploring AI generation",
    features: [
      "50 generations/month",
      "Standard image generation",
      "Standard resolution exports",
    ],
    cta: "Get Started",
    ctaHref: "/register",
    popular: false,
    accent: "var(--landing-text-muted)",
  },
  {
    name: "Professional",
    price: "$29",
    period: "/mo",
    description: "For marketers who need consistent, on-brand assets",
    features: [
      "Unlimited image generations",
      "1 Brand Model training",
      "High-resolution exports",
      "Video generation (basic)",
      "AI copywriting",
    ],
    cta: "Start Free Trial",
    ctaHref: "/register",
    popular: true,
    accent: "var(--landing-accent-primary)",
  },
  {
    name: "Agency",
    price: "$99",
    period: "/mo",
    description: "For teams managing multiple brands at scale",
    features: [
      "Everything in Professional",
      "Unlimited Brand Models",
      "Advanced video generation",
      "Team collaboration & approvals",
      "Direct channel publishing",
      "Priority support",
    ],
    cta: "Contact Sales",
    ctaHref: "mailto:sales@lumavi.ai",
    popular: false,
    accent: "var(--landing-accent-secondary)",
  },
];

export function PricingSection() {
  return (
    <AnimatedSection
      className="landing-section"
      id="pricing"
      direction="scale"
      stagger={0.12}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--landing-bg)" }}
      />
      <div className="relative z-10 max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16" data-animate>
          <h2 className="font-[var(--font-syne)] text-4xl md:text-5xl font-bold text-[var(--landing-text-primary)] mb-4">
            Start free. Scale when you&apos;re ready.
          </h2>
          <p className="text-lg text-[var(--landing-text-secondary)]">
            No credit card required. No commitment.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              data-animate
              className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "glass-card-elevated glow-pulse md:-translate-y-4"
                  : "glass-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--landing-accent-primary)] text-white px-4 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold">
                  Most Popular
                </div>
              )}

              <h3 className="font-[var(--font-syne)] text-2xl font-bold text-[var(--landing-text-primary)] mb-2">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-[var(--font-syne)] text-5xl font-extrabold text-[var(--landing-text-primary)]">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-[var(--landing-text-muted)] text-sm">
                    {plan.period}
                  </span>
                )}
              </div>
              <p className="text-[var(--landing-text-secondary)] text-sm mb-8 pb-6 border-b border-white/5 flex-grow">
                {plan.description}
              </p>

              {plan.ctaHref.startsWith("mailto:") ? (
                <a
                  href={plan.ctaHref}
                  className={`w-full text-center py-3.5 px-4 rounded-xl font-semibold text-[15px] transition-all duration-300 mb-6 ${
                    plan.popular
                      ? "btn-landing-primary"
                      : "btn-landing-secondary"
                  }`}
                >
                  {plan.cta}
                </a>
              ) : (
                <Link
                  href={plan.ctaHref}
                  className={`w-full text-center py-3.5 px-4 rounded-xl font-semibold text-[15px] transition-all duration-300 mb-6 ${
                    plan.popular
                      ? "btn-landing-primary"
                      : "btn-landing-secondary"
                  }`}
                >
                  {plan.cta}
                </Link>
              )}

              <ul className="space-y-3.5">
                {plan.features.map((feature, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-3 text-[var(--landing-text-secondary)] text-sm"
                  >
                    {CHECK_ICON(
                      plan.popular ? "#6354ff" : "rgba(240,238,246,0.3)"
                    )}
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
