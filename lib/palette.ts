"use client";

import { useSyncExternalStore } from "react";

// Paleta ativa (A "Phosphor" ou B "Dunkode"), compartilhada entre o CSS e as cenas 3D.
// O CSS lê `data-palette` no <html>; as cenas usam `usePalette()` e trocam as cores ao vivo.

export type PaletteName = "a" | "b";

export type Palette = {
  name: PaletteName;
  bg: string;
  deep: string;
  surface: string;
  title: string;
  muted: string;
  accent: string;
  accentText: string;
  signal: string;
};

/** Mesmos valores de `--p-*` em app/globals.css. */
export const palettes: Record<PaletteName, Palette> = {
  a: {
    name: "a",
    bg: "#0c0d10",
    deep: "#08090c",
    surface: "#12141a",
    title: "#ecf1f0",
    muted: "#8a9592",
    accent: "#3be87f",
    accentText: "#3be87f",
    signal: "#38e1ff",
  },
  b: {
    name: "b",
    bg: "#0b1020",
    deep: "#070a16",
    surface: "#121830",
    title: "#f7f8fc",
    muted: "#9aa0b8",
    accent: "#8b5cf6",
    accentText: "#a78bfa",
    signal: "#c4b5fd",
  },
};

export const paletteLabels: Record<PaletteName, string> = { a: "A · Phosphor", b: "B · Dunkode" };

function current(): PaletteName {
  return document.documentElement.dataset.palette === "b" ? "b" : "a";
}

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-palette"] });
  return () => observer.disconnect();
}

export function usePalette(): Palette {
  return palettes[useSyncExternalStore<PaletteName>(subscribe, current, () => "a")];
}

/** Troca a paleta e lembra a escolha (o script de boot em app/layout.tsx aplica na próxima visita). */
export function setPalette(name: PaletteName) {
  if (name === "b") document.documentElement.dataset.palette = "b";
  else delete document.documentElement.dataset.palette;
  try {
    localStorage.setItem("pf:palette", name);
  } catch {}
}
