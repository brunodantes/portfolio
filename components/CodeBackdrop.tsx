"use client";

import { useEffect, useRef } from "react";
import { dotnetLines } from "@/lib/code-lines";
import { usePreferences } from "@/lib/preferences";

const COLUMNS = 4;
const ROWS = 46;
const SPEED = 64;

function column(seed: number) {
  return Array.from({ length: ROWS }, (_, i) => dotnetLines[(seed * 17 + i) % dotnetLines.length]).join("\n");
}

const columns = Array.from({ length: COLUMNS }, (_, i) => column(i + 1));

function Sheet({ bright }: { bright?: boolean }) {
  return (
    <div
      className={`absolute inset-0 grid gap-8 px-6 ${bright ? "code-sheet-bright" : "code-sheet-dim"}`}
      style={{ gridTemplateColumns: `repeat(${COLUMNS}, 1fr)` }}
    >
      {columns.map((text, i) => (
        <pre
          key={i}
          className={`code-col ${bright ? "text-accent opacity-85" : "text-[var(--p-code)] opacity-[0.09]"} ${i >= 2 ? "max-md:hidden" : ""}`}
          style={{ ["--cb-speed" as string]: `${SPEED + i * 11}s`, ["--cb-delay" as string]: `${-i * 9}s` }}
        >
          {text}
        </pre>
      ))}
    </div>
  );
}

/** Código .NET rolando no fundo; o cursor revela uma versão acesa por baixo. */
export default function CodeBackdrop() {
  const { motion } = usePreferences();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!motion || !window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    function move(event: PointerEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.current?.style.setProperty("--cb-x", `${event.clientX}px`);
        root.current?.style.setProperty("--cb-y", `${event.clientY}px`);
      });
    }
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
    };
  }, [motion]);

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <Sheet />
      {motion && <Sheet bright />}
    </div>
  );
}
