import { ImageIcon } from "lucide-react";

type PlaceholderProps = {
  label: string;
  className?: string;
};

/**
 * Substituto de uma foto real. Troque por `next/image` quando o asset final
 * chegar; o `label` descreve o que a imagem deve mostrar.
 */
export default function Placeholder({ label, className = "" }: PlaceholderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-line/70 text-center ${className}`}
    >
      <ImageIcon className="size-5 text-soft" strokeWidth={1.5} aria-hidden />
      <span className="px-3 text-xs leading-snug text-soft">{label}</span>
    </div>
  );
}
