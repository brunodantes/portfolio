/**
 * Mundos em comparação. A barra de troca mostra só os mundos do mesmo grupo do atual:
 * a rodada 2 (quatro conceitos) e a rodada 3 (variações de jogo com tom sério).
 */
export const worldList = [
  { slug: "placa", name: "Placa de circuito", group: "conceitos" },
  { slug: "mercado", name: "Livro de ofertas", group: "conceitos" },
  { slug: "datacenter", name: "Sala de controle", group: "conceitos" },
  { slug: "jogo", name: "Ilhas (original)", group: "jogo" },
  { slug: "estrategia", name: "Estratégia", group: "jogo" },
  { slug: "tatico", name: "Sala tática", group: "jogo" },
  { slug: "orbital", name: "Mapa orbital", group: "jogo" },
  { slug: "reino", name: "Reino", group: "jogo" },
  { slug: "sombrio", name: "Terras sombrias", group: "jogo" },
] as const;

export type WorldSlug = (typeof worldList)[number]["slug"];
