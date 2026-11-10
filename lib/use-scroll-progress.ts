"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Progresso do scroll (0–1) enquanto o elemento atravessa a tela presa (`sticky`).
 * Vai para a cena por ref (sem re-render) e para o CSS pela variável `--p` do próprio elemento.
 */
export function useScrollProgress(target: RefObject<HTMLElement | null>) {
  const progress = useRef(0);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
      progress.current = p;
      el.style.setProperty("--p", p.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [target]);

  return progress;
}
