import type { ReactNode } from "react";

type HudPanelProps = {
  label: string;
  right?: ReactNode;
  glow?: boolean;
  className?: string;
  children: ReactNode;
};

/** Painel de HUD com cantos cortados, cabeçalho de telemetria e corpo. */
export default function HudPanel({ label, right, glow, className = "", children }: HudPanelProps) {
  // O clip-path dos cantos corta box-shadow; o brilho vai num drop-shadow do wrapper.
  return (
    <div
      className={className}
      style={
        glow ? { filter: "drop-shadow(0 0 18px color-mix(in oklab, var(--p-accent) 28%, transparent))" } : undefined
      }
    >
      <div className="clip-bevel border border-line-strong bg-surface">
        <div className="flex items-center justify-between gap-4 border-b border-line bg-black/25 px-5 py-2.5">
          <span className="hud text-accent-text">{label}</span>
          {right && <span className="hud text-faint">{right}</span>}
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
