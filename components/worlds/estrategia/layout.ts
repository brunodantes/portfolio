// Layout da campanha (fora da cena, para o config e o minimapa não carregarem o 3D).

export type Kind = "bench" | "warehouse" | "datatower" | "fortress" | "glasstower" | "monoliths" | "gate";
export type Island = { x: number; y: number; z: number; r: number; kind: Kind; code: string; label: string };

/** Território da campanha: uma ilha por capítulo, subindo conforme a carreira avança. */
export const ISLANDS: Island[] = [
  { x: -15, y: 0, z: 6, r: 2.3, kind: "bench", code: "T-00", label: "ETEC" },
  { x: -8.5, y: 0.9, z: 1, r: 2.5, kind: "warehouse", code: "M-01", label: "NESTLÉ" },
  { x: -2, y: 1.8, z: -4.5, r: 3, kind: "datatower", code: "M-02", label: "SINQIA" },
  { x: 5.5, y: 2.8, z: -2.5, r: 3.2, kind: "fortress", code: "M-03", label: "BTG PACTUAL" },
  { x: 11.5, y: 4, z: 3.5, r: 3, kind: "glasstower", code: "M-04", label: "ITAÚ" },
  { x: 6, y: 3.4, z: 10, r: 2.8, kind: "monoliths", code: "SKL", label: "HABILIDADES" },
  { x: 13, y: 4.8, z: 15, r: 2.4, kind: "gate", code: "NEW", label: "NOVA MISSÃO" },
];

/** Minimapa (0–1) com as mesmas posições, vistas de cima. */
export const ESTRATEGIA_MINIMAP: [number, number][] = ISLANDS.map((i) => [(i.x + 17) / 32, (i.z + 7) / 24]);

