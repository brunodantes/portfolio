"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  type Group,
  type InstancedMesh,
  type LineBasicMaterial,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import { dprFor, type DeviceProfile } from "@/lib/device";
import type { Palette } from "@/lib/palette";
import { buildGraph, tiers } from "./graph";

export type ClusterSceneProps = {
  /** Progresso do scroll do hero (0–1), lido a cada frame. */
  progress: { readonly current: number };
  active: boolean;
  reduced: boolean;
  device: DeviceProfile;
  palette: Palette;
  /** Elemento que recebe o mouse (o hero inteiro, já que o texto fica por cima do canvas). */
  eventSource: RefObject<HTMLElement | null>;
};

const MESSAGES = 72;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function Mesh({
  progress,
  reduced,
  palette,
  compact,
  eventSource,
}: Omit<ClusterSceneProps, "active" | "device"> & { compact: boolean }) {
  const graph = useMemo(() => buildGraph(), []);
  const { count, edges, out, entries } = graph;
  const edgeCount = edges.length / 2;

  const group = useRef<Group>(null);
  const nodes = useRef<InstancedMesh>(null);
  const packets = useRef<InstancedMesh>(null);
  const lineMaterial = useRef<LineBasicMaterial>(null);
  const { viewport } = useThree();

  // Estado da simulação: tudo mutável, nada de setState no frame.
  const sim = useMemo(() => {
    const random = (() => {
      let s = 7;
      return () => ((s = (s * 16807) % 2147483647) / 2147483647);
    })();
    const edge = new Uint16Array(MESSAGES);
    const t = new Float32Array(MESSAGES);
    const speed = new Float32Array(MESSAGES);
    for (let i = 0; i < MESSAGES; i++) {
      edge[i] = Math.floor(random() * edgeCount);
      t[i] = random();
      speed[i] = 0.5 + random() * 0.6;
    }
    return {
      random,
      morph: reduced ? 1 : 0,
      pos: new Float32Array(count * 3),
      offset: new Float32Array(count * 3),
      edge,
      t,
      speed,
      wave: { x: 0, y: 0, z: 0, r: 99 },
      pointer: new Vector3(),
    };
  }, [count, edgeCount, reduced]);

  const lineGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(edgeCount * 6), 3));
    return geometry;
  }, [edgeCount]);
  useEffect(() => () => lineGeometry.dispose(), [lineGeometry]);

  const colors = useMemo(
    () => ({
      accent: new Color(palette.accent).multiplyScalar(1.6),
      signal: new Color(palette.signal).multiplyScalar(1.8),
      hot: new Color(palette.title).multiplyScalar(3),
      packet: new Color(palette.signal).multiplyScalar(3),
      line: new Color(palette.accent),
      tmp: new Color(),
    }),
    [palette],
  );

  const temp = useMemo(
    () => ({ m: new Matrix4(), q: new Quaternion(), s: new Vector3(), p: new Vector3(), a: new Vector3(), b: new Vector3() }),
    [],
  );

  // Clique: dispara um "evento" que se propaga pela malha a partir do ponto clicado.
  useEffect(() => {
    if (reduced) return;
    const el = eventSource.current;
    if (!el) return;
    function down(event: PointerEvent) {
      if (event.target instanceof Element && event.target.closest("a, button")) return;
      const local = group.current?.worldToLocal(sim.pointer.clone());
      if (!local) return;
      sim.wave = { x: local.x, y: local.y, z: local.z, r: 0 };
    }
    el.addEventListener("pointerdown", down);
    return () => el.removeEventListener("pointerdown", down);
  }, [eventSource, reduced, sim]);

  useFrame(({ clock, pointer }, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const time = reduced ? 0 : clock.elapsedTime;
    const target = reduced ? 1 : smooth(0.04, 0.62, progress.current);
    sim.morph += (target - sim.morph) * Math.min(1, dt * 4);
    const m = sim.morph;

    // Enquadramento: no desktop a malha começa à direita do texto e centraliza; no celular sobe por baixo dele.
    const g = group.current;
    if (g) {
      const narrow = viewport.aspect < 1;
      const sway = reduced ? 0 : Math.sin(time * 0.15) * 0.08;
      // Parada (movimento desligado), a malha já vem organizada mas fica ao lado do texto.
      const f = reduced ? 0 : m;
      if (narrow) {
        // Tela em pé: a arquitetura gira 90° e as camadas descem de cima para baixo.
        g.scale.setScalar(0.62);
        g.position.set(0, -2.6 + f * 2.4, 0);
        g.rotation.set(0.2 - f * 0.12, -0.25 + f * 0.2 + sway, -m * Math.PI * 0.5);
      } else {
        g.scale.setScalar(compact ? 0.82 : 0.95);
        g.position.set(2.3 - f * 2.3, f * 0.35, 0);
        g.rotation.set(0.32 - f * 0.22, -0.65 + f * 0.5 + sway, 0);
      }
    }

    // Ponteiro no plano z=0, nas coordenadas da malha.
    sim.pointer.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2, 0);
    const local = g ? g.worldToLocal(temp.p.copy(sim.pointer)) : temp.p.set(99, 99, 99);
    if (!reduced) sim.wave.r += dt * 5;

    const { chaos, arch, size, tier } = graph;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Caos à deriva -> posição na arquitetura.
      const drift = (1 - m) * 0.35;
      const cx = chaos[i3] + Math.sin(time * 0.5 + i) * drift;
      const cy = chaos[i3 + 1] + Math.cos(time * 0.4 + i * 1.3) * drift;
      const cz = chaos[i3 + 2] + Math.sin(time * 0.3 + i * 0.7) * drift;
      let x = cx + (arch[i3] - cx) * m;
      let y = cy + (arch[i3 + 1] - cy) * m;
      const z = cz + (arch[i3 + 2] - cz) * m;

      // O cursor empurra os nós próximos.
      const dx = x - local.x;
      const dy = y - local.y;
      const d = Math.hypot(dx, dy) || 1;
      const push = reduced ? 0 : Math.max(0, 1.3 - d) * 0.55;
      const k = Math.min(1, dt * 6);
      sim.offset[i3] += ((dx / d) * push - sim.offset[i3]) * k;
      sim.offset[i3 + 1] += ((dy / d) * push - sim.offset[i3 + 1]) * k;
      x += sim.offset[i3];
      y += sim.offset[i3 + 1];
      sim.pos[i3] = x;
      sim.pos[i3 + 1] = y;
      sim.pos[i3 + 2] = z;

      // Onda do clique: o nó acende quando a frente da onda passa por ele.
      const wd = Math.hypot(x - sim.wave.x, y - sim.wave.y, z - sim.wave.z);
      const pulse = Math.exp(-((wd - sim.wave.r) ** 2) * 6) * Math.max(0, 1 - sim.wave.r / 7);
      const breathe = reduced ? 0 : Math.sin(time * 2 + i * 0.9) * 0.08;

      temp.s.setScalar(size[i] * (1 + pulse * 1.4 + breathe));
      temp.q.setFromAxisAngle(temp.a.set(0.3, 1, 0.2).normalize(), time * 0.6 + i);
      temp.m.compose(temp.b.set(x, y, z), temp.q, temp.s);
      nodes.current?.setMatrixAt(i, temp.m);
      const base = tiers[tier[i]].signal ? colors.signal : colors.accent;
      colors.tmp.copy(base).lerp(colors.hot, Math.min(1, pulse));
      nodes.current?.setColorAt(i, colors.tmp);
    }
    if (nodes.current) {
      nodes.current.instanceMatrix.needsUpdate = true;
      if (nodes.current.instanceColor) nodes.current.instanceColor.needsUpdate = true;
    }

    // Arestas acompanham os nós; ficam mais visíveis conforme a arquitetura se forma.
    const line = lineGeometry.getAttribute("position") as BufferAttribute;
    for (let e = 0; e < edgeCount; e++) {
      const a = edges[e * 2] * 3;
      const b = edges[e * 2 + 1] * 3;
      line.array[e * 6] = sim.pos[a];
      line.array[e * 6 + 1] = sim.pos[a + 1];
      line.array[e * 6 + 2] = sim.pos[a + 2];
      line.array[e * 6 + 3] = sim.pos[b];
      line.array[e * 6 + 4] = sim.pos[b + 1];
      line.array[e * 6 + 5] = sim.pos[b + 2];
    }
    line.needsUpdate = true;
    if (lineMaterial.current) lineMaterial.current.opacity = 0.07 + m * 0.33;

    // Mensagens: andam pela aresta e seguem para a próxima camada; no fim, nasce outra na borda.
    for (let i = 0; i < MESSAGES; i++) {
      sim.t[i] += reduced ? 0 : dt * sim.speed[i] * (0.35 + m * 0.9);
      if (sim.t[i] >= 1) {
        const next = out[edges[sim.edge[i] * 2 + 1]];
        const pool = next.length ? next : entries;
        sim.edge[i] = pool[Math.floor(sim.random() * pool.length)];
        sim.t[i] = 0;
      }
      const a = edges[sim.edge[i] * 2] * 3;
      const b = edges[sim.edge[i] * 2 + 1] * 3;
      const t = sim.t[i];
      temp.b.set(
        sim.pos[a] + (sim.pos[b] - sim.pos[a]) * t,
        sim.pos[a + 1] + (sim.pos[b + 1] - sim.pos[a + 1]) * t,
        sim.pos[a + 2] + (sim.pos[b + 2] - sim.pos[a + 2]) * t,
      );
      temp.s.setScalar(0.4 + m * 0.6);
      temp.m.compose(temp.b, temp.q.identity(), temp.s);
      packets.current?.setMatrixAt(i, temp.m);
    }
    if (packets.current) packets.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={nodes} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <lineSegments geometry={lineGeometry} frustumCulled={false}>
        <lineBasicMaterial ref={lineMaterial} color={colors.line} transparent opacity={0.1} depthWrite={false} />
      </lineSegments>
      <instancedMesh ref={packets} args={[undefined, undefined, MESSAGES]} frustumCulled={false}>
        <octahedronGeometry args={[0.055, 0]} />
        <meshBasicMaterial color={colors.packet} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/** Hero "Malha distribuída": do caos à arquitetura orientada a eventos, guiado pelo scroll. */
export default function ClusterScene({ progress, active, reduced, device, palette, eventSource }: ClusterSceneProps) {
  return (
    <Canvas
      dpr={dprFor(device)}
      camera={{ fov: 35, position: [0, 0, 10] }}
      gl={{ alpha: true, antialias: true }}
      frameloop={active && !reduced ? "always" : "demand"}
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
    >
      <Mesh progress={progress} reduced={reduced} palette={palette} compact={device.low} eventSource={eventSource} />
      {!device.low && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.25} intensity={0.8} radius={0.7} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
