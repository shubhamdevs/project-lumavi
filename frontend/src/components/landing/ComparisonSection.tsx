"use client";

import { AnimatedSection } from "./AnimatedSection";

export function ComparisonSection() {
  return (
    <AnimatedSection
      className="landing-section"
      id="comparison"
      direction="up"
      stagger={0.15}
      style-bg="true"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, #06091a 0%, #0a0e2a 50%, #06091a 100%)",
        }}
      />
      <div className="relative z-10 max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16" data-animate>
          <h2 className="font-[var(--font-syne)] text-4xl md:text-5xl font-bold text-[var(--landing-text-primary)] mb-4">
            See the difference brand intelligence makes.
          </h2>
          <p className="text-lg text-[var(--landing-text-secondary)] max-w-xl mx-auto">
            Generic AI tools hallucinate your brand. Lumavi learns it.
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Without Lumavi */}
          <div data-animate className="glass-card overflow-hidden group">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <span className="font-[var(--font-jetbrains-mono)] text-xs tracking-widest text-[var(--landing-text-muted)] uppercase">
                Generic AI Output
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-red-400"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M7 7l6 6M13 7l-6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="p-6 md:p-8 aspect-video relative flex items-center justify-center bg-white/[0.02]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Generic generated image showing off-brand output"
                className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale mix-blend-luminosity"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuANEUMt7M-9RD-p9IRcUpRWhdJCn3Ts_34zxjyIwVYjGTgGPfhlNugH6z907hDGwEMXvznUlqbs9XhFRSpp3OnV4qoXKKP2irJJfAv9aa8M7Be6dF4ozMattNGmzTNBhdr_dUMAf1fHmRGbqe6pqA-DQvAyXX5vlNwyS9mRx8xCXF50Iux5xnssy_up1FpBQjZ6jOs2GuUVT4k8L-L1vDE_cNpVw_jbm_CwCaKQjfr0xx2PQbbX8TlQNsgXTRz24s6LwO3SGsDahhI"
              />
              <div className="relative z-10 bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M8 5v3M8 11h.01M14 8A6 6 0 112 8a6 6 0 0112 0z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Off-brand colors · Inconsistent style · No guidelines
              </div>
            </div>
          </div>

          {/* With Lumavi */}
          <div
            data-animate
            className="glass-card-elevated overflow-hidden group relative"
          >
            <div className="absolute inset-0 rounded-2xl glow-pulse pointer-events-none" />
            <div className="relative z-10">
              <div className="p-4 border-b border-[var(--landing-accent-primary)]/10 flex items-center justify-between">
                <span className="font-[var(--font-jetbrains-mono)] text-xs tracking-widest text-[var(--landing-accent-primary)] uppercase font-bold">
                  Lumavi Brand-Trained Output
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-[var(--landing-accent-secondary)]"
                >
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M6.5 10l2.5 2.5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="p-6 md:p-8 aspect-video relative flex items-end justify-end">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="On-brand generated image using Lumavi's brand model"
                  className="absolute inset-0 w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXPXBqfxFS32wfhKTgWJT8kxNZXOvE7Py3LAUceeK1Ygnfdx93_rpR63CB6SzkKwc0rANmynvIGW6KgNak23ur-zr4Vf8pEL6vravMjsSBnV8NpTJqfebUAkLRwiOddaDJIEP8k-qi3WFbYp1hyChe2yM1inBvwlP7S1vOBhGMer-twagx3Akr4RNPWFJp89H0q06xMonfUy8p-ruJ6GrMMJ37hDok0ZDNruBsG9oPd8BNY97x7HTItKHftw7aYjEi-vkhQs_UxD8"
                />
                <div className="relative z-10 glass-card px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 m-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--landing-accent-secondary)] animate-pulse" />
                  <span className="text-[var(--landing-text-secondary)]">
                    Brand Model: Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
