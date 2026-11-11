"use client";

import { useEffect, useRef } from "react";
import { useDeviceProfile } from "@/lib/device";
import { usePreferences } from "@/lib/preferences";
import { CHAPTER_COUNT, useChapters } from "./chapters";
import ChapterContent from "./ChapterContent";
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
 * Casca dos mundos 3D: a cena ocupa a tela inteira (fixa) e os capítulos rolam por cima.
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
      {world.game && <GameHud world={world} chapters={chapters} />}

      <main id="conteudo" className="relative z-10">
        {chapters.map((chapter, index) => (
          <section
            key={chapter.id}
            id={chapter.id}
            data-chapter={index}
            aria-label={chapter.label}
            className={`pointer-events-none flex min-h-[100svh] items-center px-4 py-24 sm:px-10 lg:px-16 ${alignClass[world.align[index] ?? "left"]}`}
          >
            <div
              className={`pointer-events-auto w-full max-w-[520px] ${
                world.cardMotion && motion
                  ? `transition-[opacity,translate] duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${
                      active === index
                        ? "translate-x-0 opacity-100"
                        : `opacity-0 ${world.align[index] === "right" ? "translate-x-16" : "-translate-x-16"}`
                    }`
                  : ""
              }`}
            >
              {world.game ? (
                <GameChapter chapter={chapter} index={index} skin={world.skin} />
              ) : (
                <ChapterContent chapter={chapter} index={index} skin={world.skin} />
              )}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
