"use client";

import dynamic from "next/dynamic";
import HeroHud from "./hero/HeroHud";
import HeroCluster from "./hero/HeroCluster";
import type { HeroVariant } from "@/lib/types";

const PacketScene = dynamic(() => import("../three/packet/PacketScene"), { ssr: false });

/** Hero da direção pedida (PLANO.md, seção 2). */
export default function Hero({ variant = "hud" }: { variant?: HeroVariant }) {
  if (variant === "cluster") return <HeroCluster />;
  if (variant === "pacote") return <HeroHud scene={PacketScene} />;
  return <HeroHud />;
}
