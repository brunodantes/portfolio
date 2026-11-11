"use client";

import { useSyncExternalStore } from "react";

export type DeviceProfile = {
  /** O navegador consegue criar um contexto WebGL. */
  webgl: boolean;
  /** Aparelho modesto (poucos núcleos/memória, tela pequena ou economia de dados): menos efeitos e DPR menor. */
  low: boolean;
};

let cached: DeviceProfile | null = null;
const SERVER: DeviceProfile = { webgl: true, low: false };

function detect(): DeviceProfile {
  if (cached) return cached;
  let webgl = false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    webgl = Boolean(gl);
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl = false;
  }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  const low = cores <= 4 || memory <= 4 || Boolean(nav.connection?.saveData) || window.innerWidth < 640;
  cached = { webgl, low };
  return cached;
}

const subscribe = () => () => {};

/** Perfil do aparelho (calculado uma vez). No servidor assume WebGL disponível e aparelho bom. */
export function useDeviceProfile(): DeviceProfile {
  return useSyncExternalStore(subscribe, detect, () => SERVER);
}

/** Faixa de DPR para o Canvas conforme o aparelho. */
export function dprFor(profile: DeviceProfile): [number, number] {
  return profile.low ? [1, 1.25] : [1, 1.75];
}
