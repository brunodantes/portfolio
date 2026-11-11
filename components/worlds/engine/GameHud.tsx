"use client";

import { useContent } from "@/lib/preferences";
import type { Chapter } from "./chapters";
import { useActiveChapter } from "./journey";
import type { WorldConfig } from "./types";

/** Nível alcançado em cada capítulo (a campanha termina no LV 09 do perfil). */
function levelOf(chapter: Chapter) {
  if (chapter.kind === "job" && chapter.job) return chapter.job.level;
  if (chapter.kind === "stack" || chapter.kind === "contact") return 9;
  return 1;
}

/** HUD dos mundos de jogo: nível e XP no topo, aviso de "subiu de nível" e minimapa clicável. */
export default function GameHud({ world, chapters }: { world: WorldConfig; chapters: Chapter[] }) {
  const { ui } = useContent();
  const active = useActiveChapter();
  const game = world.game!;
  const level = levelOf(chapters[active] ?? chapters[0]);
  const xp = active / (chapters.length - 1);
  const points = game.minimap;
  // O minimapa começa na origem (capítulo 1).
  const toSvg = ([x, y]: [number, number]) => [6 + x * 88, 6 + y * 58] as const;

  return (
    <>
      <div
        className={`pointer-events-none fixed bottom-16 left-4 z-30 grid w-[200px] gap-1.5 px-3 py-2 sm:left-10 lg:bottom-4 lg:left-16 ${game.panel}`}
        aria-hidden
      >
        <div className="flex items-baseline justify-between font-mono text-[11px]">
          <span style={{ color: game.accent }}>LV {String(level).padStart(2, "0")}</span>
          <span className="opacity-60">XP {Math.round(xp * 100)}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${xp * 100}%`, background: game.accent }} />
        </div>
      </div>

      {/* Aviso de nível: remonta a cada nível novo e toca a animação uma vez. */}
      {active > 1 && (
        <div
          key={level}
          aria-live="polite"
          className="level-up pointer-events-none fixed top-24 left-1/2 z-30 -translate-x-1/2 font-mono text-[13px] tracking-[0.3em] uppercase"
          style={{ color: game.accent }}
        >
          {ui.game.levelUp} · LV {String(level).padStart(2, "0")}
        </div>
      )}

      <nav aria-label={ui.game.map} className={`fixed right-4 bottom-16 z-30 hidden p-2 lg:block ${game.panel}`}>
        <svg viewBox="0 0 100 70" className="h-[105px] w-[150px]">
          <polyline
            points={points.map((p) => toSvg(p).join(",")).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.25}
            strokeDasharray="2 2"
          />
          <polyline
            points={points
              .slice(0, Math.max(1, active))
              .map((p) => toSvg(p).join(","))
              .join(" ")}
            fill="none"
            stroke={game.accent}
            strokeWidth={1.2}
          />
          {points.map((p, i) => {
            const chapter = chapters[i + 1];
            const [x, y] = toSvg(p);
            const here = active === i + 1;
            const seen = active >= i + 1;
            return (
              <a key={chapter.id} href={`#${chapter.id}`} aria-label={chapter.label} aria-current={here ? "step" : undefined}>
                <circle cx={x} cy={y} r={here ? 4 : 2.6} fill={seen ? game.accent : "currentColor"} fillOpacity={seen ? 1 : 0.35} />
                {here && <circle cx={x} cy={y} r={7} fill="none" stroke={game.accent} strokeOpacity={0.6} />}
              </a>
            );
          })}
        </svg>
      </nav>
    </>
  );
}
