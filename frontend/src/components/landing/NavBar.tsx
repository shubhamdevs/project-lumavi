"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsapConfig";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
];

export function NavBar() {
  const navRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll-aware glass effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // GSAP entrance animation
  useGSAP(
    () => {
      gsap.from("[data-nav-item]", {
        y: -20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.2,
      });
    },
    { scope: navRef }
  );

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setMobileOpen(false);
    }
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#06091a]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="flex justify-between items-center h-20 px-6 md:px-10 max-w-[1280px] mx-auto">
        {/* Logo */}
        <Link
          href="/"
          data-nav-item
          className="font-[var(--font-hahmlet)] text-2xl font-extrabold text-white tracking-tight flex items-center gap-1.5 hover:opacity-95 transition-opacity"
        >
          <span className="bg-gradient-to-r from-white via-[#8ecae6] to-[#219ebc] text-transparent bg-clip-text">
            Lumavi
          </span>
          <span className="text-[var(--landing-accent-primary)] text-xl">
            ✦
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              data-nav-item
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="text-[var(--landing-text-secondary)] hover:text-white transition-colors text-[15px] font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-4" data-nav-item>
          <Link
            href="/login"
            className="btn-landing-secondary !py-2.5 !px-6 text-[15px]"
          >
            Log In
          </Link>
          <Link href="/register" className="btn-landing-primary !py-2.5 !px-6">
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 z-50"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              mobileOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              mobileOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile slide-in panel */}
      <div
        className={`md:hidden fixed inset-0 top-20 bg-[#06091a]/95 backdrop-blur-xl transition-all duration-400 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center gap-8 pt-16 px-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="text-white text-xl font-medium hover:text-[var(--landing-accent-primary)] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
            <Link
              href="/login"
              className="btn-landing-secondary w-full text-center"
              onClick={() => setMobileOpen(false)}
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="btn-landing-primary w-full text-center"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
