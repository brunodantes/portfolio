"use client";

import HudPanel from "../../ui/HudPanel";
import StatReadout from "../../ui/StatReadout";
import Tag from "../../ui/Tag";
import Stage, { type StageSceneProps } from "../../three/stage/Stage";
import HeroIntro from "./HeroIntro";
import { playerStack } from "@/lib/site-data";
import { useContent } from "@/lib/preferences";
import type { ComponentType } from "react";

/** Hero em duas colunas: texto à esquerda e, à direita, o painel de stats ou uma cena 3D compacta. */
export default function HeroHud({ scene }: { scene?: ComponentType<StageSceneProps> }) {
  const { player, ui, stats } = useContent();

  return (
    <section id="inicio" className="relative overflow-hidden border-b border-line px-page pt-16 pb-14 md:pt-24 md:pb-20">
      <div
        aria-hidden
        className="absolute -inset-16 [background-image:linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(120%_80%_at_50%_10%,#000,transparent_72%)]"
      />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <HeroIntro />

        {scene ? (
          <Stage
            scene={scene}
            className="aspect-square w-full max-w-[520px] justify-self-center [mask-image:radial-gradient(closest-side,#000_72%,transparent)]"
            fallback={
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--color-accent-soft),transparent_60%)]" />
            }
          />
        ) : (
          <HudPanel label={ui.hero.panelLabel} right={player.level} glow>
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
        )}
      </div>
    </section>
  );
}
