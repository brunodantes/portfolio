// Cores da paleta "Phosphor" para as cenas 3D (mesmos valores de `--p-*` em app/globals.css).

export type Palette = {
  bg: string;
  deep: string;
  surface: string;
  title: string;
  muted: string;
  accent: string;
  accentText: string;
  signal: string;
};

export const palette: Palette = {
  bg: "#0c0d10",
  deep: "#08090c",
  surface: "#12141a",
  title: "#ecf1f0",
  muted: "#8a9592",
  accent: "#3be87f",
  accentText: "#3be87f",
  signal: "#38e1ff",
};

/** Mantido como hook para as cenas não dependerem de onde a paleta vem. */
export function usePalette(): Palette {
  return palette;
}
