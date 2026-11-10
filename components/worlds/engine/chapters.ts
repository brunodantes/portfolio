"use client";

import { useMemo } from "react";
import { useContent } from "@/lib/preferences";
import type { Content, Job } from "@/lib/types";

export type ChapterKind = "intro" | "origin" | "job" | "stack" | "contact";

export type Chapter = { id: string; kind: ChapterKind; label: string; job?: Job };

/**
 * Roteiro comum a todos os mundos, em ordem cronológica: quem sou, a origem,
 * as empresas da mais antiga à atual, o equipamento e o contato.
 */
export function buildChapters(content: Content): Chapter[] {
  const jobs = [...content.experience].reverse();
  return [
    { id: "inicio", kind: "intro", label: content.player.name },
    { id: "origem", kind: "origin", label: content.ui.worlds.originTitle },
    ...jobs.map((job, i) => ({ id: `job-${i}`, kind: "job" as const, label: job.org, job })),
    { id: "stack", kind: "stack", label: content.ui.nav.stack },
    { id: "contato", kind: "contact", label: content.ui.nav.contato },
  ];
}

/** Quantidade fixa de capítulos (os mundos posicionam a câmera para cada um). */
export const CHAPTER_COUNT = 8;

export function useChapters() {
  const content = useContent();
  return useMemo(() => buildChapters(content), [content]);
}
