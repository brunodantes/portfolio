"use client";

import { useEffect, useRef } from "react";
import { useDeviceProfile } from "@/lib/device";
import { usePreferences } from "@/lib/preferences";
import { CHAPTER_COUNT, useChapters } from "./chapters";
import GameChapter from "./GameChapter";
import GameHud from "./GameHud";
import { journey, setActiveChapter, useActiveChapter } from "./journey";
import WorldHud from "./WorldHud";
import type { WorldConfig } from "./types";

const alignClass = {
  left: "justify-start",
  right: "justify-end",
  center: "justify-center",
};

/**
 * Casca da experiência: a cena 3D ocupa a tela inteira (fixa) e os capítulos (missões) rolam por cima.
 * O capítulo contínuo vem da posição do centro da tela entre os centros dos capítulos.
 */
export default function WorldShell({ world }: { world: WorldConfig }) {
  const root = useRef<HTMLDivElement>(null);
  const chapters = useChapters();
  const { motion } = usePreferences();
  const device = useDeviceProfile();
  const Scene = world.scene;
  const active = useActiveChapter();

  useEffect(() => {
    journey.reduced = !motion;
  }, [motion]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    journey.count = CHAPTER_COUNT;
    let mids: number[] = [];
    let frame = 0;

    const measure = () => {
      const sections = el.querySelectorAll<HTMLElement>("[data-chapter]");
      mids = Array.from(sections, (s) => s.offsetTop + s.offsetHeight / 2);
    };
    const update = () => {
      frame = 0;
      if (!mids.length) return;
      const center = window.scrollY + window.innerHeight / 2;
      let chapter = 0;
      if (center >= mids[mids.length - 1]) chapter = mids.length - 1;
      else {
        for (let i = 0; i < mids.length - 1; i++) {
          if (center < mids[i + 1]) {
            chapter = i + Math.max(0, (center - mids[i]) / (mids[i + 1] - mids[i]));
            break;
          }
        }
      }
      journey.chapter = chapter;
      setActiveChapter(Math.round(chapter));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    measure();
    update();
    const resize = new ResizeObserver(() => {
      measure();
      schedule();
    });
    resize.observe(el);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  return (
    <div ref={root} className={`relative ${world.className}`}>
      <div aria-hidden className="fixed inset-0 z-0">
        {device.webgl ? <Scene device={device} reduced={!motion} eventSource={root} /> : world.fallback}
      </div>
      {world.overlay && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[1]">
          {world.overlay}
        </div>
      )}

      <WorldHud world={world} chapters={chapters} />
      <GameHud world={world} chapters={chapters} />

      <main id="conteudo" className="relative z-10">
        {chapters.map((chapter, index) => (
          <section
            key={chapter.id}
            id={chapter.id}
            data-chapter={index}
            aria-label={chapter.label}
            className={`pointer-events-none flex min-h-[100svh] items-center px-4 pt-20 pb-28 sm:px-10 lg:px-16 ${alignClass[world.align[index] ?? "left"]}`}
          >
            {/* Cartão: nunca mais alto que a tela (rola por dentro); invisível só enquanto inativo e sem foco. */}
            <div
              data-lenis-prevent
              className={`world-card pointer-events-auto max-h-[calc(100svh-190px)] w-full max-w-[520px] overflow-y-auto overscroll-contain ${
                world.cardMotion && motion
                  ? `transition-[opacity,translate] duration-700 ease-[cubic-bezier(.16,1,.3,1)] focus-within:pointer-events-auto focus-within:translate-x-0 focus-within:opacity-100 ${
                      active === index
                        ? "translate-x-0 opacity-100"
                        : `pointer-events-none opacity-0 ${world.align[index] === "right" ? "translate-x-16" : "-translate-x-16"}`
                    }`
                  : ""
              }`}
            >
              <GameChapter chapter={chapter} skin={world.skin} code={world.game.codes[index] ?? ""} />
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
