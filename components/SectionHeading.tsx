import type { SectionCopy } from "@/lib/types";

export default function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "start",
  as: Tag = "h2",
}: SectionCopy & { align?: "start" | "center"; as?: "h1" | "h2" }) {
  return (
    <div
      className={`flex flex-col gap-3 ${align === "center" ? "items-center text-center" : ""}`}
    >
      <span className="text-sm font-medium text-eyebrow">
        {eyebrow}
      </span>
      <Tag className="font-display text-[34px] leading-[1.08] md:text-[46px]">{title}</Tag>
      {intro && <p className="max-w-[56ch] text-lg leading-[1.6] text-body">{intro}</p>}
    </div>
  );
}
