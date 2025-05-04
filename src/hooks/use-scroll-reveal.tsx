import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
  animationClass?: string;
  delay?: number; // ms
}

export function useScrollReveal<T extends HTMLElement = HTMLElement>({
  animationClass = 'animate-fade-in-up',
  delay = 0,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }
    let ticking = false;
    const node = ref.current;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.disconnect();
            }
            ticking = false;
          });
          ticking = true;
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    if (isVisible && ref.current) {
      const el = ref.current;
      if (delay) {
        el.style.animationDelay = `${delay}ms`;
      }
      el.classList.add(animationClass);
    }
  }, [isVisible, animationClass, delay]);

  return { ref, isVisible };
} 