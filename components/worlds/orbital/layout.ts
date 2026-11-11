// Layout do sistema (fora da cena, para o config e o minimapa não carregarem o 3D).

export type BodyKind = "moon" | "planet" | "giant" | "station" | "constellation" | "gate";
export type Body = { radius: number; angle: number; size: number; color: string; kind: BodyKind; code: string; label: string };

/** Um corpo por capítulo a partir da origem, cada um numa órbita mais distante da estrela. */
export const BODIES: Body[] = [
  { radius: 4, angle: 200, size: 0.45, color: "#8fa39a", kind: "moon", code: "T-00", label: "ETEC" },
  { radius: 6.5, angle: 245, size: 0.6, color: "#d9b27c", kind: "planet", code: "M-01", label: "NESTLÉ" },
  { radius: 9.5, angle: 292, size: 0.85, color: "#3f7fd9", kind: "planet", code: "M-02", label: "SINQIA" },
  { radius: 13, angle: 340, size: 1.25, color: "#9b7bd4", kind: "giant", code: "M-03", label: "BTG PACTUAL" },
  { radius: 16.5, angle: 30, size: 1, color: "#ff8f3f", kind: "station", code: "M-04", label: "ITAÚ" },
  { radius: 20, angle: 78, size: 1.6, color: "#5ef2d6", kind: "constellation", code: "SKL", label: "HABILIDADES" },
  { radius: 23.5, angle: 122, size: 1.4, color: "#5ef2d6", kind: "gate", code: "NEW", label: "NOVA MISSÃO" },
];

export function bodyPosition(b: Body): [number, number, number] {
  const a = (b.angle * Math.PI) / 180;
  return [Math.cos(a) * b.radius, Math.sin(a * 2) * 0.6, Math.sin(a) * b.radius];
}

export const ORBITAL_MINIMAP: [number, number][] = BODIES.map((b) => {
  const [x, , z] = bodyPosition(b);
  return [0.5 + x / 52, 0.5 + z / 52];
});
