"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { HeroVariant } from "@/lib/types";
import type { StageSceneProps } from "./stage/Stage";

/** Cena 3D de cada direção do hero, carregada só no cliente. `hud` não tem cena. */
export const heroScenes: Partial<Record<HeroVariant, ComponentType<StageSceneProps>>> = {
  pacote: dynamic(() => import("./packet/PacketScene"), { ssr: false }),
};
