/** Mundos em comparação (rodada 2). Os configs ficam em components/worlds/<slug>/. */
export const worldList = [
  { slug: "placa", name: "Placa de circuito" },
  { slug: "mercado", name: "Livro de ofertas" },
  { slug: "datacenter", name: "Sala de controle" },
  { slug: "jogo", name: "Mundo do jogo" },
] as const;

export type WorldSlug = (typeof worldList)[number]["slug"];
