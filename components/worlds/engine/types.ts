import type { ComponentType, ReactNode, RefObject } from "react";
import type { DeviceProfile } from "@/lib/device";
import type { Skin } from "./skin";

export type WorldSceneProps = {
  device: DeviceProfile;
  /** Movimento desligado: cena parada, câmera corta direto entre capítulos. */
  reduced: boolean;
  /** Elemento que recebe o mouse (o mundo inteiro, já que o texto fica por cima do canvas). */
  eventSource: RefObject<HTMLElement | null>;
};

export type WorldConfig = {
  /** Classes do container do mundo: fundo, cor de texto, fontes (variáveis CSS). */
  className: string;
  scene: ComponentType<WorldSceneProps>;
  skin: Skin;
  /** Onde o cartão de cada capítulo fica na tela, para não cobrir o foco da cena. */
  align: ("left" | "right" | "center")[];
  /** Sem WebGL: fundo estático no lugar da cena. */
  fallback: ReactNode;
  /** Camadas decorativas por cima da cena (scanlines, vinheta…). */
  overlay?: ReactNode;
  /** Classes do HUD fixo (barra do topo e índice de capítulos). */
  hud: { bar: string; brand: string; item: string; itemActive: string; button: string };
};
