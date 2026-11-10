import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  tone?: "paper" | "alt";
  className?: string;
  children: ReactNode;
};

/** Faixa de página com gutter e largura máxima padrão. */
export default function Section({ id, tone = "paper", className = "", children }: SectionProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 px-6 py-16 md:px-12 md:py-24 ${tone === "alt" ? "bg-alt" : ""} ${className}`}
    >
      <div className="mx-auto max-w-[1200px]">{children}</div>
    </section>
  );
}
