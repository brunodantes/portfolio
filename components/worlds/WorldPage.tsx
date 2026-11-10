"use client";

import WorldShell from "./engine/WorldShell";
import { placa } from "./placa/config";
import type { WorldSlug } from "./registry";
import type { WorldConfig } from "./engine/types";

const worlds: Partial<Record<WorldSlug, WorldConfig>> = { placa };

export default function WorldPage({ slug }: { slug: WorldSlug }) {
  const world = worlds[slug] ?? placa;
  return <WorldShell world={world} />;
}
