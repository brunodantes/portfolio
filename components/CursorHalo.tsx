"use client";

import { useEffect, useRef } from "react";
import { usePreferences } from "@/lib/preferences";

/** Luz suave que segue o cursor. Só com mouse e com movimento ligado. */
export default function CursorHalo() {
  const { motion } = usePreferences();
  const halo = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!motion || !window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    function move(event: PointerEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        for (const el of [halo.current, ring.current]) {
          el?.style.setProperty("--hx", `${event.clientX}px`);
          el?.style.setProperty("--hy", `${event.clientY}px`);
          if (el) el.style.opacity = "1";
        }
      });
    }
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
    };
  }, [motion]);

  if (!motion) return null;
  return (
    <>
      <div
        ref={halo}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1] opacity-0 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle 320px at var(--hx) var(--hy), color-mix(in oklab, var(--p-accent) 13%, transparent), transparent 70%)",
        }}
      />
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed z-[60] -mt-[13px] -ml-[13px] size-[26px] rounded-full border opacity-0"
        style={{
          left: "var(--hx)",
          top: "var(--hy)",
          borderColor: "color-mix(in oklab, var(--p-accent) 55%, transparent)",
        }}
      />
    </>
  );
}
