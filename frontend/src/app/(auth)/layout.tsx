import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #10143a 0%, #06091a 70%)',
      }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 landing-grid-bg opacity-30 pointer-events-none" />

      {/* Radial glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,84,255,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Logo */}
      <Link
        href="/"
        className="relative z-10 font-[var(--font-syne)] text-2xl font-bold text-white mb-8 hover:opacity-80 transition-opacity"
      >
        Lumavi
        <span className="text-[var(--landing-accent-primary)] ml-0.5">✦</span>
      </Link>

      {/* Auth form container */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Back to home */}
      <Link
        href="/"
        className="relative z-10 mt-8 text-[var(--landing-text-muted)] text-sm hover:text-white transition-colors"
      >
        ← Back to home
      </Link>
    </div>
  );
}
