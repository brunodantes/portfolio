// Layout da mesa tática (fora da cena, para o config e o minimapa não carregarem o 3D).

export type OpKind = "op" | "radar" | "beacon";
export type Op = { x: number; z: number; kind: OpKind; code: string; label: string; sub: string };

/** Operações na mesa, uma por capítulo a partir da origem. */
export const OPS: Op[] = [
  { x: -11, z: 5, kind: "op", code: "OP-00", label: "ETEC", sub: "2014" },
  { x: -6.5, z: 1.5, kind: "op", code: "OP-01", label: "NESTLÉ", sub: "2016–2017" },
  { x: -2, z: -4.5, kind: "op", code: "OP-02", label: "SINQIA", sub: "2018–2023" },
  { x: 4, z: -1.5, kind: "op", code: "OP-03", label: "BTG PACTUAL", sub: "2023–2026" },
  { x: 9.5, z: 3.5, kind: "op", code: "OP-04", label: "ITAÚ", sub: "2026 · ATIVA" },
  { x: 3, z: 6.5, kind: "radar", code: "SKL", label: "HABILIDADES", sub: "LV 09" },
  { x: 11, z: -5.5, kind: "beacon", code: "NEW", label: "NOVA MISSÃO", sub: "AGUARDANDO" },
];

export const TABLE = { w: 30, d: 20 };

/** Relevo da mesa: soma de senos determinística (mesma fórmula na cena e nos marcadores). */
export function heightAt(x: number, z: number) {
  return (
    (0.6 * Math.sin(x * 0.35) * Math.cos(z * 0.4) + 0.35 * Math.sin(x * 0.9 + z * 0.6) + 0.25 * Math.cos(z * 1.1 - x * 0.3) + 0.6) *
    1.1
  );
}

export const TATICO_MINIMAP: [number, number][] = OPS.map((o) => [(o.x + TABLE.w / 2) / TABLE.w, (o.z + TABLE.d / 2) / TABLE.d]);
