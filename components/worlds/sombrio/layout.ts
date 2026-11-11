// Layout das Terras sombrias (fora da cena, para o config e o minimapa não carregarem o 3D).

export type ShrineKind = "votive" | "chapel" | "watchtower" | "gate" | "cathedral" | "reliquary" | "sigil";

/** Santuários da jornada, um por capítulo a partir da origem. `facing` 0 = fachada para +z. */
export type Shrine = { x: number; z: number; facing: number; size: number; kind: ShrineKind; label: string };

export const SHRINES: Shrine[] = [
  { x: 4, z: 24, facing: -0.25, size: 0.9, kind: "votive", label: "ETEC" },
  { x: -6, z: 13, facing: 0.3, size: 1.1, kind: "chapel", label: "NESTLÉ" },
  { x: 5, z: 1, facing: -0.3, size: 1.3, kind: "watchtower", label: "SINQIA" },
  { x: -8, z: -11, facing: 0.3, size: 1.5, kind: "gate", label: "BTG PACTUAL" },
  { x: 3, z: -27, facing: -0.1, size: 1.9, kind: "cathedral", label: "ITAÚ" },
  { x: -7, z: -43, facing: 0.35, size: 1.2, kind: "reliquary", label: "HABILIDADES" },
  { x: 6, z: -55, facing: -0.3, size: 1, kind: "sigil", label: "NOVA MISSÃO" },
];

/** Lado do cartão em cada capítulo (alternando); o santuário fica do lado oposto da tela. */
export const SOMBRIO_ALIGN: ("left" | "right")[] = ["left", "left", "right", "left", "right", "left", "right", "left"];

export const front = (s: Shrine): [number, number] => [Math.sin(s.facing), Math.cos(s.facing)];

/** Onde a trilha passa em cada santuário: diante da fachada, de lado (oposto ao cartão). */
export const stopOf = (s: Shrine, index: number): [number, number] => {
  const [fx, fz] = front(s);
  const [rx, rz] = [Math.cos(s.facing), -Math.sin(s.facing)];
  const side = SOMBRIO_ALIGN[index + 1] === "left" ? 1 : -1;
  const ahead = 2.8 + s.size * 1.2;
  const aside = (2.2 + s.size * 1.2) * side;
  return [s.x + fx * ahead + rx * aside, s.z + fz * ahead + rz * aside];
};

export const cameraDistance = (s: Shrine) => (s.kind === "cathedral" ? 25 : s.kind === "gate" ? 21 : 8 + s.size * 4.2);

/** Planície rochosa, achatada nos santuários e mais alta nas bordas. */
export function groundAt(x: number, z: number) {
  let h =
    0.7 * Math.sin(x * 0.21 + 1.3) * Math.cos(z * 0.15) +
    0.45 * Math.sin(x * 0.53 - z * 0.31) +
    0.3 * Math.cos(z * 0.47 + x * 0.17) +
    0.2 * Math.sin(x * 1.3) * Math.sin(z * 1.1);
  h = h * 0.8 + 0.3;
  h *= 0.35 + Math.min(1, Math.abs(x) / 16) * 1.8;
  for (const s of SHRINES) {
    const d = Math.hypot(x - s.x, z - s.z);
    h *= 1 - Math.max(0, 1 - d / (5.5 + s.size * 2.2));
  }
  return h;
}

export const SOMBRIO_MINIMAP: [number, number][] = SHRINES.map((s) => [(s.x + 14) / 28, (30 - s.z) / 92]);
