"use client";

import Link from "next/link";
import { heroVariants } from "@/lib/site-data";
import type { HeroVariant } from "@/lib/types";

/** Barra fixa das prévias: escolhe a direção do hero. Só existe em /conceitos. */
export default function ConceptBar({ current }: { current: HeroVariant }) {
  const pill = "rounded-[4px] px-3 py-1.5 transition-colors";
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 flex flex-wrap items-center gap-2 text-[13px] sm:inset-x-auto sm:left-4">
      <nav
        aria-label="Direções do hero"
        className="flex flex-wrap items-center gap-1 rounded-md border border-line-strong bg-deep/90 p-1 backdrop-blur-md"
      >
        {heroVariants.map((v, index) =>
          v.ready ? (
            <Link
              key={v.slug}
              href={`/conceitos/${v.slug}`}
              aria-current={v.slug === current ? "page" : undefined}
              className={`${pill} ${v.slug === current ? "bg-accent font-semibold text-on-accent" : "text-body hover:text-title"}`}
            >
              {index + 1}. {v.name}
            </Link>
          ) : (
            <span key={v.slug} className={`${pill} text-faint`} title="Em produção">
              {index + 1}. {v.name}
            </span>
          ),
        )}
      </nav>
    </div>
  );
}
