"use client";

import { ChevronRight, GitBranch, Mail, MapPin } from "lucide-react";
import FxButton from "../ui/FxButton";
import HudPanel from "../ui/HudPanel";
import StatReadout from "../ui/StatReadout";
import Tag from "../ui/Tag";
import TypedLines from "../ui/TypedLines";
import Stage from "../three/stage/Stage";
import { heroScenes } from "../three/hero-scenes";
import { playerStack } from "@/lib/site-data";
import { useContent } from "@/lib/preferences";
import type { HeroVariant } from "@/lib/types";

export default function Hero({ variant = "hud" }: { variant?: HeroVariant }) {
  const scene = heroScenes[variant];
  const { player, ui, builds, stats } = useContent();
  const t = ui.hero;

  return (
    <section
      id="inicio"
      className="relative overflow-hidden border-b border-line px-page pt-16 pb-14 md:pt-24 md:pb-20"
    >
      <div
        aria-hidden
        className="absolute -inset-16 [background-image:linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(120%_80%_at_50%_10%,#000,transparent_72%)]"
      />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div className="grid gap-7">
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

        {/* Palco do hero: a cena 3D da direção escolhida, ou o painel de stats no HUD 2D. */}
        {scene ? (
          <Stage
            scene={scene}
            className="aspect-square w-full max-w-[520px] justify-self-center [mask-image:radial-gradient(closest-side,#000_72%,transparent)]"
            fallback={
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--color-accent-soft),transparent_60%)]" />
            }
          />
        ) : (
          <div data-stage="hero">
            <HudPanel label={t.panelLabel} right={player.level} glow>
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <StatReadout key={stat.label} {...stat} />
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
                {playerStack.map((tech) => (
                  <Tag key={tech.label} icon={tech.icon}>
                    {tech.label}
                  </Tag>
                ))}
              </div>
            </HudPanel>
          </div>
        )}
      </div>
    </section>
  );
}
