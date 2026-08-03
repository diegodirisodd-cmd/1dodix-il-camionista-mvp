"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  as?: "div" | "section" | "li";
};

// Anima l'elemento con un fade-up quando entra nel viewport.
// Rispetta prefers-reduced-motion tramite la regola globale in globals.css
// (che azzera le durate delle transizioni), quindi qui basta aggiungere
// la classe "is-visible" al momento giusto.
export function ScrollReveal({ children, className, delayMs = 0, as = "div" }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => setVisible(true), delayMs);
          observer.disconnect();
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delayMs]);

  const Comp = as;

  return (
    <Comp ref={ref as never} className={clsx("reveal", visible && "is-visible", className)}>
      {children}
    </Comp>
  );
}
