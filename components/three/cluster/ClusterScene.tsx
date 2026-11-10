"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer } from "@react-three/postprocessing";
import type { BloomEffect, ChromaticAberrationEffect } from "postprocessing";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  type Group,
  type InstancedMesh,
  type LineBasicMaterial,
  Matrix4,
  Plane,
  type PointLight,
  type Points,
  Quaternion,
  Vector2,
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

/** Estado compartilhado entre a malha, a câmera e os efeitos (mutável, sem re-render). */
type Shared = {
  morph: number;
  /** 0–1: força da onda do clique, que também pulsa o bloom e a aberração cromática. */
  impulse: number;
  /** Ponteiro projetado no plano z=0 (coordenadas do mundo). */
  pointer: Vector3;
};

type WorldProps = Omit<ClusterSceneProps, "active" | "device"> & { compact: boolean; shared: Shared };

const MESSAGES = 72;
const X_AXIS = new Vector3(1, 0, 0);
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Nós (vidro iluminado + núcleo aceso), arestas e mensagens em rastro. */
function Mesh({ progress, reduced, palette, compact, eventSource, shared }: WorldProps) {
  const graph = useMemo(() => buildGraph(), []);
  const { count, edges, out, entries } = graph;
  const edgeCount = edges.length / 2;

  const group = useRef<Group>(null);
  const shells = useRef<InstancedMesh>(null);
  const cores = useRef<InstancedMesh>(null);
  const streaks = useRef<InstancedMesh>(null);
  const lineMaterial = useRef<LineBasicMaterial>(null);

  const sim = useMemo(() => {
    const random = (() => {
      let s = 7;
      return () => (s = (s * 16807) % 2147483647) / 2147483647;
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
      pos: new Float32Array(count * 3),
      offset: new Float32Array(count * 3),
      edge,
      t,
      speed,
      wave: { x: 0, y: 0, z: 0, r: 99 },
    };
  }, [count, edgeCount]);

  const lineGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(edgeCount * 6), 3));
    return geometry;
  }, [edgeCount]);
  useEffect(() => () => lineGeometry.dispose(), [lineGeometry]);

  const colors = useMemo(
    () => ({
      shellAccent: new Color(palette.accent),
      shellSignal: new Color(palette.signal),
      coreAccent: new Color(palette.accent).multiplyScalar(2.4),
      coreSignal: new Color(palette.signal).multiplyScalar(2.6),
      hot: new Color(palette.title).multiplyScalar(4),
      streak: new Color(palette.signal).multiplyScalar(3.2),
      line: new Color(palette.accent),
      tmp: new Color(),
    }),
    [palette],
  );

  const temp = useMemo(
    () => ({
      m: new Matrix4(),
      q: new Quaternion(),
      s: new Vector3(),
      p: new Vector3(),
      a: new Vector3(),
      b: new Vector3(),
      dir: new Vector3(),
    }),
    [],
  );

  // Clique: dispara um "evento" que se propaga pela malha a partir do ponto clicado.
  useEffect(() => {
    if (reduced) return;
    const el = eventSource.current;
    if (!el) return;
    function down(event: PointerEvent) {
      if (event.target instanceof Element && event.target.closest("a, button")) return;
      const local = group.current?.worldToLocal(shared.pointer.clone());
      if (!local) return;
      sim.wave = { x: local.x, y: local.y, z: local.z, r: 0 };
      shared.impulse = 1;
    }
    el.addEventListener("pointerdown", down);
    return () => el.removeEventListener("pointerdown", down);
  }, [eventSource, reduced, sim, shared]);

  useFrame(({ clock, viewport }, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const time = reduced ? 0 : clock.elapsedTime;
    const target = reduced ? 1 : smooth(0.04, 0.62, progress.current);
    shared.morph += (target - shared.morph) * Math.min(1, dt * 4);
    shared.impulse = Math.max(0, shared.impulse - dt * 1.4);
    const m = shared.morph;

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

    const local = g ? g.worldToLocal(temp.p.copy(shared.pointer)) : temp.p.set(99, 99, 99);
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

      // Onda do clique: o nó acende e cresce quando a frente da onda passa por ele.
      const wd = Math.hypot(x - sim.wave.x, y - sim.wave.y, z - sim.wave.z);
      const pulse = Math.exp(-((wd - sim.wave.r) ** 2) * 6) * Math.max(0, 1 - sim.wave.r / 7);
      const breathe = reduced ? 0 : Math.sin(time * 2 + i * 0.9) * 0.08;
      const signal = tiers[tier[i]].signal;

      temp.q.setFromAxisAngle(temp.a.set(0.3, 1, 0.2).normalize(), time * 0.5 + i);
      temp.b.set(x, y, z);
      temp.s.setScalar(size[i] * (1.25 + pulse * 1.3 + breathe));
      temp.m.compose(temp.b, temp.q, temp.s);
      shells.current?.setMatrixAt(i, temp.m);
      shells.current?.setColorAt(i, signal ? colors.shellSignal : colors.shellAccent);

      // Núcleo gira ao contrário, dentro do vidro.
      temp.q.setFromAxisAngle(temp.a.set(-0.2, 1, 0.4).normalize(), -time * 1.4 - i);
      temp.s.setScalar(size[i] * (0.5 + pulse * 0.7 + breathe));
      temp.m.compose(temp.b, temp.q, temp.s);
      cores.current?.setMatrixAt(i, temp.m);
      colors.tmp.copy(signal ? colors.coreSignal : colors.coreAccent).lerp(colors.hot, Math.min(1, pulse * 1.3));
      cores.current?.setColorAt(i, colors.tmp);
    }
    for (const mesh of [shells.current, cores.current]) {
      if (!mesh) continue;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
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
    if (lineMaterial.current) lineMaterial.current.opacity = 0.08 + m * 0.3 + shared.impulse * 0.25;

    // Mensagens: rastros de luz que andam pela aresta e seguem para a próxima camada.
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
      temp.dir.set(sim.pos[b] - sim.pos[a], sim.pos[b + 1] - sim.pos[a + 1], sim.pos[b + 2] - sim.pos[a + 2]);
      const length = temp.dir.length() || 1;
      temp.b.set(sim.pos[a], sim.pos[a + 1], sim.pos[a + 2]).addScaledVector(temp.dir, t);
      temp.q.setFromUnitVectors(X_AXIS, temp.dir.divideScalar(length));
      // O rastro estica com a velocidade e some nas pontas da aresta.
      const fade = Math.sin(Math.PI * t);
      temp.s.set((0.05 + m * 0.17) * fade + 0.015, 0.016, 0.016);
      temp.m.compose(temp.b, temp.q, temp.s);
      streaks.current?.setMatrixAt(i, temp.m);
    }
    if (streaks.current) streaks.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <instancedMesh ref={shells} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial transparent opacity={0.5} roughness={0.3} metalness={0.35} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={cores} args={[undefined, undefined, count]} frustumCulled={false}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <lineSegments geometry={lineGeometry} frustumCulled={false}>
        <lineBasicMaterial ref={lineMaterial} color={colors.line} transparent opacity={0.1} depthWrite={false} />
      </lineSegments>
      <instancedMesh ref={streaks} args={[undefined, undefined, MESSAGES]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={colors.streak} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/** Poeira digital em várias profundidades: dá escala e paralaxe quando a câmera se move. */
function Dust({ palette, amount, reduced }: { palette: Palette; amount: number; reduced: boolean }) {
  const points = useRef<Points>(null);
  const geometry = useMemo(() => {
    let s = 11;
    const random = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const position = new Float32Array(amount * 3);
    for (let i = 0; i < amount; i++) {
      position[i * 3] = (random() - 0.5) * 26;
      position[i * 3 + 1] = (random() - 0.5) * 15;
      position[i * 3 + 2] = -12 + random() * 16;
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(position, 3));
    return g;
  }, [amount]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (!reduced && points.current) points.current.rotation.y += Math.min(delta, 1 / 30) * 0.012;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        color={palette.accent}
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Câmera viva: mergulha dentro da malha no meio da transição e recua para a vista frontal,
 * com paralaxe do mouse. Também projeta o ponteiro no plano z=0 para a malha usar.
 */
function CameraRig({ shared, reduced, palette }: { shared: Shared; reduced: boolean; palette: Palette }) {
  const plane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), []);
  const look = useMemo(() => new Vector3(), []);
  const keyA = useRef<PointLight>(null);
  const keyB = useRef<PointLight>(null);

  useFrame(({ camera, pointer, raycaster, viewport, clock }, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const narrow = viewport.aspect < 1;
    const m = shared.morph;
    const dive = reduced ? 0 : Math.sin(Math.PI * m);
    const px = reduced ? 0 : pointer.x;
    const py = reduced ? 0 : pointer.y;
    const tx = px * (narrow ? 0.3 : 0.9) - dive * (narrow ? 0.3 : 1.4);
    const ty = py * (narrow ? 0.2 : 0.5) + dive * 0.5;
    const tz = (narrow ? 11 : 10) - dive * (narrow ? 2.5 : 4.2);
    const k = reduced ? 1 : Math.min(1, dt * 3);
    camera.position.x += (tx - camera.position.x) * k;
    camera.position.y += (ty - camera.position.y) * k;
    camera.position.z += (tz - camera.position.z) * k;
    look.set(dive * (narrow ? 0 : 0.6), 0, 0);
    camera.lookAt(look);

    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, shared.pointer);

    // Luzes coloridas orbitando: o vidro dos nós muda de reflexo conforme elas passam.
    const t = reduced ? 1 : clock.elapsedTime * 0.35;
    keyA.current?.position.set(Math.cos(t) * 6, 2.5, Math.sin(t) * 6);
    keyB.current?.position.set(Math.cos(t + Math.PI) * 6, -2, Math.sin(t + Math.PI) * 6);
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 7]} intensity={1.4} />
      <pointLight ref={keyA} intensity={20} distance={14} color={palette.signal} />
      <pointLight ref={keyB} intensity={16} distance={14} color={palette.accent} />
    </>
  );
}

/** Bloom e aberração cromática que pulsam com a onda do clique. */
function Effects({ shared }: { shared: Shared }) {
  const bloom = useRef<BloomEffect>(null);
  const chroma = useRef<ChromaticAberrationEffect>(null);
  const offset = useMemo(() => new Vector2(0, 0), []);

  useFrame(() => {
    const i = shared.impulse;
    if (bloom.current) bloom.current.intensity = 0.85 + i * 1.6;
    if (chroma.current) chroma.current.offset.set(0.0004 + i * 0.004, 0.0002 + i * 0.0025);
  });

  return (
    <EffectComposer multisampling={0}>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.8} luminanceSmoothing={0.25} intensity={0.85} radius={0.72} />
      <ChromaticAberration ref={chroma} offset={offset} radialModulation={false} modulationOffset={0} />
    </EffectComposer>
  );
}

/** Hero "Malha distribuída": do caos à arquitetura orientada a eventos, guiado pelo scroll. */
export default function ClusterScene({ progress, active, reduced, device, palette, eventSource }: ClusterSceneProps) {
  const shared = useMemo<Shared>(
    () => ({ morph: reduced ? 1 : 0, impulse: 0, pointer: new Vector3(99, 99, 0) }),
    [reduced],
  );
  const compact = device.low;

  return (
    <Canvas
      dpr={dprFor(device)}
      camera={{ fov: 35, position: [0, 0, 10] }}
      gl={{ alpha: true, antialias: true }}
      frameloop={active && !reduced ? "always" : "demand"}
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
    >
      <fog attach="fog" args={[palette.bg, 9, 24]} />
      <CameraRig shared={shared} reduced={reduced} palette={palette} />
      <Dust palette={palette} amount={compact ? 260 : 700} reduced={reduced} />
      <Mesh
        progress={progress}
        reduced={reduced}
        palette={palette}
        compact={compact}
        eventSource={eventSource}
        shared={shared}
      />
      {!compact && <Effects shared={shared} />}
    </Canvas>
  );
}
