"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { worldList } from "../registry";
import { setPreferences, useContent, usePreferences } from "@/lib/preferences";
import type { Chapter } from "./chapters";
import { useActiveChapter } from "./journey";
import type { WorldConfig } from "./types";

/** Barra fixa do mundo: nome, índice de capítulos, idioma, movimento e currículo; embaixo, a troca de mundo. */
export default function WorldHud({ world, chapters }: { world: WorldConfig; chapters: Chapter[] }) {
  const { player, ui } = useContent();
  const { locale, motion } = usePreferences();
  const active = useActiveChapter();
  const path = usePathname();
  const hud = world.hud;
  const currentGroup = worldList.find((w) => path === `/mundos/${w.slug}`)?.group ?? "jogo";

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
            {ui.contact.motion}
          </button>
          <a href={player.resumeUrl} target="_blank" rel="noopener noreferrer" className={hud.button}>
            {ui.resumeBtn}
          </a>
        </div>
      </header>

      <nav
        aria-label={ui.worlds.chapters}
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

      <nav
        aria-label="Mundos"
        className="fixed bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-full border border-white/15 bg-black/70 p-1 text-[12px] text-white/80 backdrop-blur-md"
      >
        {worldList.filter((w) => w.group === currentGroup).map((w) => {
          const current = path === `/mundos/${w.slug}`;
          return (
            <Link
              key={w.slug}
              href={`/mundos/${w.slug}`}
              aria-current={current ? "page" : undefined}
              className={`rounded-full px-3 py-1.5 whitespace-nowrap ${current ? "bg-white font-semibold text-black" : "hover:text-white"}`}
            >
              {w.name}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
