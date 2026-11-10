"use client";

import { usePreferences } from "@/lib/preferences";
import type { Skill } from "@/lib/types";

/** Barra de proficiência. `filled` controla a animação (cheia quando a seção entra na tela). */
export default function XpBar({ label, value, caption, tone = "accent", filled }: Skill & { filled: boolean }) {
  const { motion } = usePreferences();
  const color = tone === "signal" ? "var(--p-signal)" : "var(--p-accent)";
  // Com movimento desligado, a barra já aparece cheia e sem transição.
  const width = filled || !motion ? `${value}%` : "0%";
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-4 text-[13px]">
        <span className="text-body">{label}</span>
        <span className="font-mono text-[11px] text-muted">{caption}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-[3px] border border-line bg-deep"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div
          className={`h-full ${motion ? "transition-[width] duration-700 ease-[cubic-bezier(.16,1,.3,1)]" : ""}`}
          style={{ width, background: color, boxShadow: `0 0 12px -2px ${color}` }}
        />
      </div>
    </div>
  );
}
