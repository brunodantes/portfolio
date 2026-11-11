"use client";

import { useMemo } from "react";
import { useContent } from "@/lib/preferences";
import type { Content, Job } from "@/lib/types";

export type ChapterKind = "intro" | "job" | "stack" | "contact";

export type Chapter = { id: string; kind: ChapterKind; label: string; job?: Job };

/**
 * Roteiro da página, em ordem cronológica: o briefing (perfil e formação),
 * as empresas da mais antiga à atual, o equipamento e o contato.
 */
export function buildChapters(content: Content): Chapter[] {
  const jobs = [...content.experience].reverse();
  return [
    { id: "inicio", kind: "intro", label: content.ui.briefing.kicker.split(" · ")[0] },
    ...jobs.map((job, i) => ({ id: `job-${i}`, kind: "job" as const, label: job.org, job })),
    { id: "capacidades", kind: "stack", label: content.ui.skills.title },
    { id: "contato", kind: "contact", label: content.ui.contact.label },
  ];
}

/** Quantidade fixa de capítulos (a cena posiciona a câmera para cada um). */
export const CHAPTER_COUNT = 7;

export function useChapters() {
  const content = useContent();
  return useMemo(() => buildChapters(content), [content]);
}
