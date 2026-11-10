"use client";

import { useEffect, type ReactNode, type RefObject } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { dprFor } from "@/lib/device";
import { useActiveChapter } from "./journey";
import type { WorldSceneProps } from "./types";

/** Com movimento desligado o Canvas só desenha sob demanda: redesenha quando o capítulo muda. */
function RedrawOnChapter() {
  const chapter = useActiveChapter();
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    invalidate();
  }, [chapter, invalidate]);
  return null;
}

type WorldCanvasProps = WorldSceneProps & {
  fov?: number;
  /** Cor de fundo do mundo (o Canvas é opaco, então vinheta e grão funcionam). */
  background: string;
  children: ReactNode;
};

/** Canvas padrão dos mundos: tela cheia, opaco, mouse vindo do mundo inteiro. */
export default function WorldCanvas({ device, reduced, eventSource, fov = 40, background, children }: WorldCanvasProps) {
  return (
    <Canvas
      dpr={dprFor(device)}
      camera={{ fov, position: [0, 10, 14], near: 0.1, far: 200 }}
      gl={{ antialias: !device.low, powerPreference: "high-performance" }}
      frameloop={reduced ? "demand" : "always"}
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
    >
      <color attach="background" args={[background]} />
      {reduced && <RedrawOnChapter />}
      {children}
    </Canvas>
  );
}
