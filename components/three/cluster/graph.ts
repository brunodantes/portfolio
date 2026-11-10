// Grafo da "malha distribuída": camadas de uma arquitetura orientada a eventos.
// Cada nó tem duas posições: espalhado no caos e no lugar certo da arquitetura.
// Determinístico (semente fixa) para a cena ser igual em toda visita.

export type Tier = { name: string; count: number; x: number; size: number; signal: boolean };

/** Da esquerda para a direita: o caminho de uma requisição até os dados. */
export const tiers: Tier[] = [
  { name: "edge", count: 2, x: -3.2, size: 0.2, signal: true },
  { name: "api", count: 6, x: -1.6, size: 0.15, signal: false },
  { name: "services", count: 12, x: 0, size: 0.15, signal: false },
  { name: "broker", count: 4, x: 1.6, size: 0.22, signal: true },
  { name: "workers", count: 9, x: 3, size: 0.15, signal: false },
  { name: "data", count: 3, x: 4.3, size: 0.24, signal: true },
];

export type Graph = {
  count: number;
  tier: Uint8Array;
  size: Float32Array;
  /** Posições no caos e na arquitetura, xyz intercalados. */
  chaos: Float32Array;
  arch: Float32Array;
  /** Arestas como pares de índices de nós [from, to, from, to…]. */
  edges: Uint16Array;
  /** Arestas que saem de cada nó, para as mensagens seguirem o fluxo. */
  out: number[][];
  /** Arestas que saem da borda: onde nascem as mensagens novas. */
  entries: number[];
};

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function buildGraph(): Graph {
  const random = rng(20161201);
  const count = tiers.reduce((sum, t) => sum + t.count, 0);
  const tier = new Uint8Array(count);
  const size = new Float32Array(count);
  const chaos = new Float32Array(count * 3);
  const arch = new Float32Array(count * 3);
  const center = (tiers[0].x + tiers[tiers.length - 1].x) / 2;
  const starts: number[] = [];

  let n = 0;
  tiers.forEach((t, ti) => {
    starts.push(n);
    const rows = Math.min(t.count, 4);
    const cols = Math.ceil(t.count / rows);
    for (let i = 0; i < t.count; i++, n++) {
      tier[n] = ti;
      size[n] = t.size;
      const row = i % rows;
      const col = Math.floor(i / rows);
      arch[n * 3] = t.x - center;
      arch[n * 3 + 1] = (row - (rows - 1) / 2) * 0.85;
      arch[n * 3 + 2] = (col - (cols - 1) / 2) * 0.9;
      // Caos: pontos num elipsoide.
      const u = random() * Math.PI * 2;
      const v = Math.acos(2 * random() - 1);
      const r = 0.45 + random() * 0.55;
      chaos[n * 3] = Math.sin(v) * Math.cos(u) * 4.2 * r;
      chaos[n * 3 + 1] = Math.cos(v) * 2.6 * r;
      chaos[n * 3 + 2] = Math.sin(v) * Math.sin(u) * 2.6 * r;
    }
  });

  // Cada nó liga a 1 ou 2 nós da camada seguinte, na mesma altura relativa.
  const pairs: number[] = [];
  const seen = new Set<string>();
  for (let ti = 0; ti < tiers.length - 1; ti++) {
    const a = tiers[ti];
    const b = tiers[ti + 1];
    for (let i = 0; i < a.count; i++) {
      const base = a.count === 1 ? 0 : Math.round((i * (b.count - 1)) / (a.count - 1));
      const links = new Set([base, Math.min(b.count - 1, Math.max(0, base + (random() < 0.5 ? -1 : 1)))]);
      if (a.count < b.count) links.add(Math.floor(random() * b.count));
      for (const j of links) {
        const from = starts[ti] + i;
        const to = starts[ti + 1] + j;
        const key = `${from}-${to}`;
        if (seen.has(key)) continue;
        seen.add(key);
        pairs.push(from, to);
      }
    }
  }
  // Garante que todo nó recebe ao menos uma aresta.
  for (let ti = 1; ti < tiers.length; ti++) {
    for (let j = 0; j < tiers[ti].count; j++) {
      const to = starts[ti] + j;
      let has = false;
      for (let k = 1; k < pairs.length; k += 2) if (pairs[k] === to) has = true;
      if (!has) pairs.push(starts[ti - 1] + Math.floor(random() * tiers[ti - 1].count), to);
    }
  }

  const edges = Uint16Array.from(pairs);
  const out: number[][] = Array.from({ length: count }, () => []);
  for (let e = 0; e < edges.length / 2; e++) out[edges[e * 2]].push(e);
  const entries = out.slice(0, tiers[0].count).flat();

  return { count, tier, size, chaos, arch, edges, out, entries };
}
