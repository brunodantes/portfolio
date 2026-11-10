"use client";

import { useSyncExternalStore } from "react";

/**
 * Estado da jornada pelo mundo 3D: escrito pelo scroll (WorldShell) e lido pelas cenas a cada frame,
 * sem re-render. Só o capítulo ativo (inteiro) avisa o React, para a interface marcar onde o visitante está.
 */
export const journey = {
  /** Capítulo contínuo: 2.5 = no meio do caminho entre o capítulo 2 e o 3. */
  chapter: 0,
  /** Capítulo suavizado pela cena (a câmera segue este). */
  smooth: 0,
  count: 1,
  /** Movimento desligado: a câmera corta direto para o capítulo, sem voar. */
  reduced: false,
  /** 0–1: impulso de interação (clique no mundo), lido pelos efeitos. */
  impulse: 0,
};

let active = 0;
const listeners = new Set<() => void>();

export function setActiveChapter(index: number) {
  if (index === active) return;
  active = index;
  listeners.forEach((listener) => listener());
}

export function useActiveChapter() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => active,
    () => 0,
  );
}
