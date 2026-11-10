"use client";

import { ChevronRight, GitBranch, Mail, MapPin } from "lucide-react";
import FxButton from "../../ui/FxButton";
import TypedLines from "../../ui/TypedLines";
import { useContent } from "@/lib/preferences";

/** Coluna de texto do hero (nome, título, foco, resumo, CTAs), comum a todas as direções. */
export default function HeroIntro({ className = "" }: { className?: string }) {
  const { player, ui, builds } = useContent();
  const t = ui.hero;
  return (
    <div className={`grid gap-7 ${className}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[18px] font-semibold text-title">{player.fullName}</span>
        <span className="text-[14px] text-muted">{player.role}</span>
      </div>

      <h1 className="text-glow max-w-[16ch] font-display text-[30px] uppercase leading-[1.12] text-accent-text sm:text-[40px] lg:text-[48px]">
        {t.headline}
      </h1>

      <p className="flex flex-wrap items-center gap-x-2 font-mono text-[14px]">
        <span className="text-faint">{t.focusKicker}:</span>
        <span className="text-accent-text">
          <TypedLines lines={builds} />
        </span>
      </p>

      <p className="max-w-[52ch] text-[17px] leading-[1.65] text-muted">{player.summary}</p>

      <div className="flex flex-wrap items-center gap-3">
        <FxButton href="#trajetoria" size="lg" icon={ChevronRight}>
          {t.ctaPrimary}
        </FxButton>
        <FxButton href="#contato" variant="ghost" size="lg" icon={Mail}>
          {t.ctaSecondary}
        </FxButton>
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted">
        <li className="inline-flex items-center gap-2">
          <MapPin className="size-3.5" aria-hidden />
          {player.city}
        </li>
        <li>
          <a
            href={`https://${player.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-accent-text"
          >
            <GitBranch className="size-3.5" aria-hidden />
            {player.github}
          </a>
        </li>
      </ul>
    </div>
  );
}
