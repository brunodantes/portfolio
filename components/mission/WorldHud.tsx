"use client";

import { setPreferences, useContent, usePreferences } from "@/lib/preferences";
import type { Chapter } from "./chapters";
import { useActiveChapter } from "./journey";
import type { WorldConfig } from "./types";

/** Barra fixa: nome, idioma, movimento e currículo; à direita, o índice de capítulos. */
export default function WorldHud({ world, chapters }: { world: WorldConfig; chapters: Chapter[] }) {
  const { player, ui } = useContent();
  const { locale, motion } = usePreferences();
  const active = useActiveChapter();
  const hud = world.hud;

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-4 px-4 py-3 sm:px-10 lg:px-16 ${hud.bar}`}>
        <a href="#inicio" className={hud.brand}>
          {player.name}
        </a>
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Idioma / Language" className="flex">
            {(["pt", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={locale === l}
                onClick={() => setPreferences({ locale: l })}
                className={`cursor-pointer px-2 py-1 uppercase ${locale === l ? hud.itemActive : hud.item}`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={motion}
            onClick={() => setPreferences({ motion: !motion })}
            className={`cursor-pointer px-2 py-1 ${motion ? hud.itemActive : hud.item}`}
          >
            {ui.motion}
          </button>
          <a href={player.resumeUrl} target="_blank" rel="noopener noreferrer" className={hud.button}>
            {ui.resumeBtn}
          </a>
        </div>
      </header>

      <nav
        aria-label={ui.chapters}
        className="fixed top-1/2 right-3 z-30 hidden -translate-y-1/2 flex-col items-end gap-1 lg:flex"
      >
        {chapters.map((c, i) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            aria-current={active === i ? "step" : undefined}
            className={`group flex items-center gap-2 px-1 py-1 text-[11px] ${active === i ? hud.itemActive : hud.item}`}
          >
            <span className="opacity-0 transition-opacity group-hover:opacity-100 group-aria-[current=step]:opacity-100">{c.label}</span>
            <span aria-hidden className={`block h-px transition-all ${active === i ? "w-8 bg-current" : "w-4 bg-current opacity-50"}`} />
          </a>
        ))}
      </nav>

    </>
  );
}
