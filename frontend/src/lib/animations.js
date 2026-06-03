import { useCallback, useEffect, useRef, useState } from "react";

export function getReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function motionStyle(visible, reducedMotion, delayMs = 0, offsetY = 16) {
  if (reducedMotion) {
    return { opacity: 1, transform: "translateY(0)" };
  }

  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : `translateY(${offsetY}px)`,
    transition: `opacity 700ms ease-out ${delayMs}ms, transform 700ms ease-out ${delayMs}ms`,
  };
}

export function useInView(reducedMotion, threshold = 0.15) {
  const [inView, setInView] = useState(reducedMotion);
  const observerRef = useRef(null);

  const ref = useCallback(
    (node) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node) return;

      if (reducedMotion) {
        setInView(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setInView(true);
        },
        { threshold, rootMargin: "0px 0px -8% 0px" },
      );

      observer.observe(node);
      observerRef.current = observer;

      requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const viewHeight = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top < viewHeight && rect.bottom > 0) {
          setInView(true);
        }
      });
    },
    [reducedMotion, threshold],
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return [ref, inView];
}
