"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/gsapConfig";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Animation direction: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale' */
  direction?: "up" | "down" | "left" | "right" | "fade" | "scale";
  /** Stagger delay between children with [data-animate] */
  stagger?: number;
  /** Delay before animation starts */
  delay?: number;
  /** ScrollTrigger start position */
  start?: string;
}

export function AnimatedSection({
  children,
  className = "",
  id,
  direction = "up",
  stagger = 0.12,
  delay = 0,
  start = "top 85%",
}: AnimatedSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const targets =
        sectionRef.current?.querySelectorAll("[data-animate]") ?? [];
      if (targets.length === 0) return;

      const fromVars: gsap.TweenVars = { opacity: 0 };

      switch (direction) {
        case "up":
          fromVars.y = 60;
          break;
        case "down":
          fromVars.y = -60;
          break;
        case "left":
          fromVars.x = -60;
          break;
        case "right":
          fromVars.x = 60;
          break;
        case "scale":
          fromVars.scale = 0.9;
          break;
        case "fade":
        default:
          break;
      }

      gsap.from(targets, {
        ...fromVars,
        duration: 0.8,
        stagger,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start,
          toggleActions: "play none none none",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className={className} id={id}>
      {children}
    </section>
  );
}
