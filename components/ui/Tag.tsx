import TechIcon from "./TechIcon";
import type { TechIconName } from "@/lib/types";

const tones = {
  neutral: "border-line-strong bg-title/[0.03] text-body",
  accent: "border-accent/40 bg-accent-soft text-accent-text",
  signal: "border-signal/40 bg-signal-soft text-signal-text",
};

type TagProps = { children: string; icon?: TechIconName; tone?: keyof typeof tones };

/** Tag de tecnologia em mono: é um nome técnico, não decoração. */
export default function Tag({ children, icon, tone = "neutral" }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-[5px] font-mono text-[11px] leading-none tracking-[0.04em] ${tones[tone]}`}
    >
      {icon && <TechIcon name={icon} />}
      {children}
    </span>
  );
}
