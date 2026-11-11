"use client";

import WorldShell from "./engine/WorldShell";
import { datacenter } from "./datacenter/config";
import { estrategia } from "./estrategia/config";
import { jogo } from "./jogo/config";
import { mercado } from "./mercado/config";
import { placa } from "./placa/config";
import { tatico } from "./tatico/config";
import type { WorldSlug } from "./registry";
import type { WorldConfig } from "./engine/types";

const worlds: Partial<Record<WorldSlug, WorldConfig>> = { placa, mercado, datacenter, jogo, estrategia, tatico };

export default function WorldPage({ slug }: { slug: WorldSlug }) {
  const world = worlds[slug] ?? placa;
  return <WorldShell world={world} />;
}
