import type { Stat } from "@/lib/types";

const tones = {
  accent: "text-accent-text text-glow",
  signal: "text-signal",
  plain: "text-title",
};

export default function StatReadout({ value, unit, label, tone }: Stat) {
  return (
    <div className="grid gap-1.5">
      <div className={`font-display text-[28px] leading-none ${tones[tone]}`}>
        {value}
        {unit && <span className="ml-1 text-[13px] text-muted">{unit}</span>}
      </div>
      <div className="hud text-muted">{label}</div>
    </div>
  );
}
