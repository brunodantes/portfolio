"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import type { Group } from "three";
import { dprFor } from "@/lib/device";
import Packet from "../shared/Packet";
import type { StageSceneProps } from "../stage/Stage";

function Rig({ reduced, palette }: Pick<StageSceneProps, "reduced" | "palette">) {
  const packet = useRef<Group>(null);
  const boost = useRef(0);
  const hover = useRef(false);

  useFrame(({ pointer }, delta) => {
    const dt = Math.min(delta, 1 / 30);
    // A rajada do clique decai; o hover mantém um brilho baixo.
    boost.current = Math.max(hover.current ? 0.35 : 0, boost.current - dt * 0.9);
    const g = packet.current;
    if (!g || reduced) return;
    g.rotation.x += (-pointer.y * 0.35 - g.rotation.x) * Math.min(1, dt * 4);
    g.rotation.z += (-pointer.x * 0.25 - g.rotation.z) * Math.min(1, dt * 4);
    g.position.y = Math.sin(performance.now() / 900) * 0.06;
  });

  return (
    <group
      onPointerOver={() => (hover.current = true)}
      onPointerOut={() => (hover.current = false)}
      onPointerDown={() => (boost.current = 1)}
    >
      <Packet ref={packet} palette={palette} boost={boost} reduced={reduced} />
    </group>
  );
}

/** Prévia do pacote de dados sozinho (conceito "pacote" em /conceitos). */
export default function PacketScene({ active, reduced, device, palette }: StageSceneProps) {
  return (
    <Canvas
      dpr={dprFor(device)}
      camera={{ fov: 30, position: [0, 0, 5.2] }}
      gl={{ alpha: true, antialias: true }}
      frameloop={active && !reduced ? "always" : "demand"}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 4]} intensity={30} color={palette.signal} />
      <pointLight position={[-3, -2, 2]} intensity={18} color={palette.accent} />
      <Rig reduced={reduced} palette={palette} />
      {!device.low && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.2} intensity={0.9} radius={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
