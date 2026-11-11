"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, MathUtils, Vector3 } from "three";
import { journey } from "./journey";

export type CameraKey = { pos: [number, number, number]; look: [number, number, number] };

type CameraRigProps = {
  /** Um ponto-chave por capítulo: onde a câmera fica e para onde olha. */
  keys: CameraKey[];
  /** Quanto o mouse desloca a câmera (paralaxe), em unidades do mundo. */
  parallax?: [number, number];
  /** Quão rápido a câmera alcança o scroll (maior = mais colada). */
  follow?: number;
};

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Câmera que viaja de capítulo em capítulo por curvas suaves e "estaciona" em cada um
 * enquanto o texto dele está no centro da tela. Escreve `journey.smooth` para as cenas.
 */
export default function CameraRig({ keys, parallax = [0.6, 0.35], follow = 3 }: CameraRigProps) {
  const curves = useMemo(
    () => ({
      pos: new CatmullRomCurve3(keys.map((k) => new Vector3(...k.pos)), false, "centripetal"),
      look: new CatmullRomCurve3(keys.map((k) => new Vector3(...k.look)), false, "centripetal"),
      p: new Vector3(),
      l: new Vector3(),
      cur: new Vector3(),
    }),
    [keys],
  );

  useFrame(({ camera, pointer }, delta) => {
    const dt = Math.min(delta, 0.1);
    const last = keys.length - 1;
    const target = Math.min(last, Math.max(0, journey.chapter));
    journey.smooth = journey.reduced ? Math.round(target) : MathUtils.damp(journey.smooth, target, follow, dt);
    const i = Math.min(last - 1, Math.floor(journey.smooth));
    const f = journey.smooth - i;
    // Estaciona perto de cada capítulo e viaja no meio do caminho entre eles.
    const t = (i + smoothstep(0.18, 0.82, f)) / last;
    curves.pos.getPoint(t, curves.p);
    curves.look.getPoint(t, curves.l);
    if (!journey.reduced) {
      curves.p.x += pointer.x * parallax[0];
      curves.p.y += pointer.y * parallax[1];
    }
    camera.position.copy(curves.p);
    curves.cur.lerp(curves.l, journey.reduced ? 1 : 1 - Math.exp(-8 * dt));
    camera.lookAt(curves.cur);
  });

  return null;
}
