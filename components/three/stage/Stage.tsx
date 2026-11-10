"use client";

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { useDeviceProfile, type DeviceProfile } from "@/lib/device";
import { usePalette, type Palette } from "@/lib/palette";
import { usePreferences } from "@/lib/preferences";

export type StageSceneProps = {
  /** Visível na tela: fora dela o loop de render para. */
  active: boolean;
  /** Movimento desligado (preferência do site ou do sistema): cena parada. */
  reduced: boolean;
  device: DeviceProfile;
  palette: Palette;
};

type StageProps<P extends object> = {
  /** Cena carregada com next/dynamic (ssr: false). */
  scene: ComponentType<StageSceneProps & P>;
  sceneProps?: P;
  /** O que aparece sem WebGL (e antes de a cena montar). */
  fallback?: ReactNode;
  className?: string;
  /** Margem para começar a montar antes de entrar na tela. */
  rootMargin?: string;
};

/**
 * Palco das cenas 3D (adaptado do dunkode-site): só monta a cena quando chega perto da tela,
 * pausa o render quando sai e mostra o `fallback` em aparelhos sem WebGL.
 */
export default function Stage<P extends object = object>({
  scene: Scene,
  sceneProps,
  fallback,
  className = "",
  rootMargin = "200px",
}: StageProps<P>) {
  const box = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [active, setActive] = useState(false);
  const { motion } = usePreferences();
  const device = useDeviceProfile();
  const palette = usePalette();

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={box} aria-hidden className={`relative ${className}`}>
      {(!device.webgl || !seen) && fallback}
      {device.webgl && seen && (
        <div className="absolute inset-0">
          <Scene {...(sceneProps as P)} active={active} reduced={!motion} device={device} palette={palette} />
        </div>
      )}
    </div>
  );
}
