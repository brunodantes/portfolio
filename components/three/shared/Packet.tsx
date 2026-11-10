"use client";

import { useMemo, useRef, type Ref } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, Color, EdgesGeometry, type Group, type Mesh } from "three";
import type { Palette } from "@/lib/palette";

export type PacketProps = {
  palette: Palette;
  /** 0–1: rajada de energia (hover/clique). Lido a cada frame, sem re-render. */
  boost?: { readonly current: number };
  reduced?: boolean;
  /** Quantos "bytes" orbitam o pacote. */
  bytes?: number;
  ref?: Ref<Group>;
};

const shell = new BoxGeometry(1, 1, 1);
const edges = new EdgesGeometry(shell);

/**
 * O pacote de dados: o fio condutor do site (PLANO.md, seção 2). Um cubo de vidro escuro
 * com arestas acesas, um núcleo girando por dentro e bytes em órbita. Cores da paleta ativa.
 * Emissivos acima de 1 (sem tone mapping) para o bloom pegar.
 */
export default function Packet({ palette, boost, reduced = false, bytes = 8, ref }: PacketProps) {
  const inner = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const orbit = useRef<Group>(null);
  const colors = useMemo(
    () => ({
      accent: new Color(palette.accent),
      signal: new Color(palette.signal),
      glass: new Color(palette.surface),
    }),
    [palette],
  );
  const glow = useMemo(() => ({ value: 0 }), []);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const b = boost?.current ?? 0;
    glow.value += (b - glow.value) * Math.min(1, dt * 6);
    const t = reduced ? 0 : clock.elapsedTime;
    if (inner.current) {
      inner.current.rotation.y += reduced ? 0 : dt * (0.35 + glow.value * 2.4);
      inner.current.rotation.x = 0.42 + Math.sin(t * 0.7) * 0.08;
    }
    if (core.current) {
      core.current.rotation.y -= reduced ? 0 : dt * (1.1 + glow.value * 4);
      core.current.rotation.z += reduced ? 0 : dt * 0.6;
      const pulse = 1 + Math.sin(t * 3) * 0.06 + glow.value * 0.25;
      core.current.scale.setScalar(pulse);
    }
    if (orbit.current) {
      orbit.current.rotation.y += reduced ? 0 : dt * (0.8 + glow.value * 3);
      orbit.current.children.forEach((child, i) => {
        child.position.y = Math.sin(t * 2 + i) * 0.12;
      });
    }
  });

  const edgeIntensity = 2.2;

  return (
    <group ref={ref}>
      <group ref={inner}>
        <mesh geometry={shell}>
          <meshStandardMaterial
            color={colors.glass}
            transparent
            opacity={0.55}
            roughness={0.25}
            metalness={0.6}
            depthWrite={false}
          />
        </mesh>
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={colors.accent.clone().multiplyScalar(edgeIntensity)} toneMapped={false} />
        </lineSegments>
        <mesh ref={core}>
          <octahedronGeometry args={[0.24, 0]} />
          <meshBasicMaterial color={colors.signal.clone().multiplyScalar(2.6)} toneMapped={false} wireframe />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.12, 0]} />
          <meshBasicMaterial color={colors.signal.clone().multiplyScalar(3)} toneMapped={false} />
        </mesh>
      </group>

      <group ref={orbit}>
        {Array.from({ length: bytes }, (_, i) => {
          const angle = (i / bytes) * Math.PI * 2;
          const r = 1.05;
          return (
            <mesh key={i} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]} rotation={[angle, angle, 0]}>
              <boxGeometry args={[0.07, 0.07, 0.07]} />
              <meshBasicMaterial
                color={(i % 3 === 0 ? colors.signal : colors.accent).clone().multiplyScalar(2)}
                toneMapped={false}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
