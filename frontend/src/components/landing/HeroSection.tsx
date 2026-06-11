"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsapConfig";
import { prefersReducedMotion } from "@/lib/gsapConfig";
import { ParticleBackground } from "./ParticleBackground";

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const tl = gsap.timeline({ delay: 0.4 });

      // Badge entrance
      tl.from("[data-hero-badge]", {
        y: -20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });

      // Headline word-by-word reveal
      tl.from(
        "[data-hero-word]",
        {
          y: 60,
          opacity: 0,
          stagger: 0.06,
          duration: 0.7,
          ease: "power3.out",
        },
        "-=0.2"
      );

      // Subhead fade up
      tl.from(
        "[data-hero-sub]",
        {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.3"
      );

      // CTA buttons scale-in
      tl.from(
        "[data-hero-cta]",
        {
          y: 20,
          opacity: 0,
          scale: 0.95,
          stagger: 0.1,
          duration: 0.5,
          ease: "back.out(1.7)",
        },
        "-=0.2"
      );

      // Floating badges stagger in
      tl.from(
        "[data-hero-chip]",
        {
          y: 40,
          opacity: 0,
          scale: 0.85,
          stagger: 0.15,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.3"
      );
    },
    { scope: heroRef }
  );

  const headlineWords = [
    "From",
    "brief",
    "to",
    "published",
    "ad.",
  ];
  const headlineAccent = ["One", "intelligent", "workspace."];

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #10143a 0%, #06091a 70%)" }}
    >
      {/* Ambient background */}
      <ParticleBackground particleCount={50} opacity={0.3} />

      {/* Grid overlay */}
      <div className="absolute inset-0 landing-grid-bg opacity-40 pointer-events-none" />

      {/* Radial glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(99,84,255,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6 py-32">
        {/* Badge */}
        <div
          data-hero-badge
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-10"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--landing-accent-secondary)] animate-pulse" />
          <span className="font-[var(--font-jetbrains-mono)] text-xs tracking-widest text-[var(--landing-text-secondary)] uppercase">
            AI-Powered Creative Marketing Platform
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-[var(--font-syne)] text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-extrabold leading-[1.05] tracking-tight mb-8">
          {headlineWords.map((word, i) => (
            <span
              key={i}
              data-hero-word
              className="inline-block text-[var(--landing-text-primary)] mr-[0.3em]"
            >
              {word}
            </span>
          ))}
          <br className="hidden sm:block" />
          {headlineAccent.map((word, i) => (
            <span
              key={`a-${i}`}
              data-hero-word
              className="inline-block text-gradient-hero mr-[0.3em]"
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Subheadline */}
        <p
          data-hero-sub
          className="text-lg sm:text-xl text-[var(--landing-text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Lumavi compresses the entire creative campaign lifecycle into a single
          AI-powered platform. Generate on-brand images, video, and copy — then
          publish directly to your channels.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/register"
            data-hero-cta
            className="btn-landing-primary w-full sm:w-auto"
          >
            Start creating — free
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
          <a href="#workflow" data-hero-cta className="btn-landing-secondary w-full sm:w-auto">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="mr-1"
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M6.5 5.5L10.5 8L6.5 10.5V5.5Z"
                fill="currentColor"
              />
            </svg>
            See how it works
          </a>
        </div>

        {/* Floating stat chips */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div
            data-hero-chip
            className="glass-card px-5 py-2.5 rounded-full animate-float"
          >
            <span className="text-[var(--landing-accent-primary)] font-bold text-lg mr-1.5">
              10×
            </span>
            <span className="text-[var(--landing-text-secondary)] text-sm">
              faster
            </span>
          </div>
          <div
            data-hero-chip
            className="glass-card px-5 py-2.5 rounded-full animate-float-delayed"
          >
            <span className="text-[var(--landing-accent-secondary)] font-bold text-lg mr-1.5">
              100%
            </span>
            <span className="text-[var(--landing-text-secondary)] text-sm">
              on-brand
            </span>
          </div>
          <div
            data-hero-chip
            className="glass-card px-5 py-2.5 rounded-full animate-float"
            style={{ animationDelay: "2s" }}
          >
            <span className="text-[var(--landing-accent-warm)] font-bold text-lg mr-1.5">
              Zero
            </span>
            <span className="text-[var(--landing-text-secondary)] text-sm">
              design skills needed
            </span>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#06091a] to-transparent pointer-events-none" />
    </section>
  );
}
