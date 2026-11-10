import type { TechIconName } from "@/lib/types";

/** Logo de tecnologia (Simple Icons em public/assets/icons/tech), pintado com a cor do texto via máscara. */
export default function TechIcon({ name, size = 13, className = "" }: { name: TechIconName; size?: number; className?: string }) {
  const url = `url("/assets/icons/tech/${name}.svg")`;
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{ width: size, height: size, maskImage: url, WebkitMaskImage: url, maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center" }}
    />
  );
}
