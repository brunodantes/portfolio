// Layout do reino (fora da cena, para o config e o minimapa não carregarem o 3D).

export type MonumentKind = "forge" | "windmill" | "tower" | "fortress" | "citadel" | "runestones" | "questboard";

/**
 * Monumentos da jornada, um por capítulo a partir da origem. `facing` é o ângulo da fachada
 * (0 = virada para +z, de onde a câmera chega); `size` regula a distância da câmera.
 */
export type Monument = { x: number; z: number; facing: number; size: number; kind: MonumentKind; label: string; sub: string };

export const MONUMENTS: Monument[] = [
  { x: -5, z: 22, facing: 0.3, size: 1, kind: "forge", label: "ETEC", sub: "MMXIV" },
  { x: 5.5, z: 11, facing: -0.3, size: 1.2, kind: "windmill", label: "NESTLÉ", sub: "MMXVI" },
  { x: -5.5, z: 0, facing: 0.25, size: 1.35, kind: "tower", label: "SINQIA", sub: "MMXVIII" },
  { x: 5.5, z: -12, facing: -0.25, size: 1.5, kind: "fortress", label: "BTG PACTUAL", sub: "MMXXIII" },
  { x: 0, z: -26, facing: 0, size: 1.8, kind: "citadel", label: "ITAÚ", sub: "MMXXVI" },
  { x: -8, z: -46, facing: 0.35, size: 1.3, kind: "runestones", label: "HABILIDADES", sub: "LV IX" },
  { x: 7, z: -59, facing: -0.3, size: 1.1, kind: "questboard", label: "NOVA MISSÃO", sub: "" },
];

export const front = (m: Monument): [number, number] => [Math.sin(m.facing), Math.cos(m.facing)];

/** Lado do cartão em cada capítulo (alternando). O monumento fica do lado oposto da tela. */
export const REINO_ALIGN: ("left" | "right")[] = ["left", "left", "right", "left", "right", "left", "right", "left"];

/**
 * Onde o cavaleiro para em cada monumento: diante da fachada, mas de lado (no lado oposto ao cartão),
 * para não ficar entre a câmera e a placa.
 */
export const stopOf = (m: Monument, index: number): [number, number] => {
  const [fx, fz] = front(m);
  const [rx, rz] = [Math.cos(m.facing), -Math.sin(m.facing)];
  const side = REINO_ALIGN[index + 1] === "left" ? 1 : -1;
  const ahead = 2.6 + m.size * 1.1;
  const aside = (2.4 + m.size * 1.3) * side;
  return [m.x + fx * ahead + rx * aside, m.z + fz * ahead + rz * aside];
};

/** Distância da câmera até a fachada de cada monumento (a cidadela pede mais espaço). */
export const cameraDistance = (m: Monument) => (m.kind === "citadel" ? 20 : 7.5 + m.size * 4.2);

/** Relevo: colinas suaves, achatado perto dos monumentos e da estrada; a cidadela fica num morro. */
export function groundAt(x: number, z: number) {
  let h = 0.9 * Math.sin(x * 0.18) * Math.cos(z * 0.12) + 0.5 * Math.sin(x * 0.41 + z * 0.23) + 0.35 * Math.cos(z * 0.37 - x * 0.2);
  h = h * 0.9 + 0.4;
  // Vale da estrada no meio, morros nas bordas.
  h *= 0.25 + Math.min(1, Math.abs(x) / 14) * 1.6;
  for (const m of MONUMENTS) {
    const d = Math.hypot(x - m.x, z - m.z);
    const flat = Math.max(0, 1 - d / (5 + m.size * 2));
    h *= 1 - flat;
  }
  const citadel = MONUMENTS[4];
  const dc = Math.hypot(x - citadel.x, z - citadel.z);
  h += Math.max(0, 1 - dc / 9) * 1.4;
  return h;
}

export const REINO_MINIMAP: [number, number][] = MONUMENTS.map((m) => [(m.x + 14) / 28, (28 - m.z) / 92]);
