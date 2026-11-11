"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import {
  AdditiveBlending,
  BackSide,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  type Group,
  type InstancedMesh,
  type Mesh,
  type MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  type PointLight,
  Vector3,
} from "three";
import { useContent } from "@/lib/preferences";
import CameraRig, { type CameraKey } from "../engine/CameraRig";
import { journey } from "../engine/journey";
import WorldCanvas from "../engine/WorldCanvas";
import type { WorldSceneProps } from "../engine/types";
import { SHRINES, SOMBRIO_ALIGN, cameraDistance, front, groundAt, stopOf, type Shrine } from "./layout";

const BG = "#16140f";
const STONE = "#77736a";
const STONE_DARK = "#4b4840";
const GOLD = new Color("#e8c26a");
const FOG = "#4d473b";

/** Quanto o santuário já foi alcançado (a luz dele acende). */
const reachOf = (index: number) => Math.min(1, Math.max(0, (journey.smooth - index - 0.6) * 2.5));

function Sky() {
  const args = useMemo(
    () => ({
      uniforms: { top: { value: new Color("#1b1a17") }, mid: { value: new Color("#4d473b") }, low: { value: new Color("#c9a25a") } },
      vertexShader: `varying vec3 vPos; void main(){ vPos = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 low; varying vec3 vPos;
        void main(){ float h = vPos.y; vec3 c = h > 0.06 ? mix(mid, top, smoothstep(0.06, 0.55, h)) : mix(low, mid, smoothstep(-0.04, 0.06, h));
        float glow = exp(-pow((vPos.x + 0.15) * 3.0, 2.0)) * smoothstep(0.35, 0.0, abs(h - 0.05)) * 0.35;
        gl_FragColor = vec4(c + vec3(0.9, 0.7, 0.35) * glow, 1.0); }`,
    }),
    [],
  );
  // O céu acompanha a câmera: assim nunca passa do plano de corte (antes virava uma "cúpula" escura).
  const sky = useRef<Mesh>(null);
  useFrame(({ camera }) => sky.current?.position.copy(camera.position));
  return (
    <mesh ref={sky} scale={150} renderOrder={-1}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial args={[args]} side={BackSide} depthWrite={false} depthTest={false} fog={false} />
    </mesh>
  );
}

/** Silhueta colossal no horizonte: uma torre partida, com feixes de luz dourada. */
function DistantSpire() {
  const beams = useRef<(MeshBasicMaterial | null)[]>([]);
  useFrame(({ clock }) => {
    beams.current.forEach((m, i) => {
      if (m) m.opacity = 0.05 + (journey.reduced ? 0.03 : (Math.sin(clock.elapsedTime * 0.4 + i * 2) * 0.5 + 0.5) * 0.06);
    });
  });
  return (
    <group position={[-28, 0, -140]}>
      <mesh position-y={32}>
        <cylinderGeometry args={[1.6, 3.6, 64, 7]} />
        <meshBasicMaterial color="#3d382e" fog={false} />
      </mesh>
      <mesh position={[1.2, 67, 0]} rotation-z={0.35}>
        <cylinderGeometry args={[0.7, 1.6, 10, 6]} />
        <meshBasicMaterial color="#3d382e" fog={false} />
      </mesh>
      {[-1, 0, 1].map((k, i) => (
        <mesh key={k} position={[k * 9, 40, 10]} rotation-z={k * 0.18}>
          <cylinderGeometry args={[1.2, 5, 90, 12, 1, true]} />
          <meshBasicMaterial
            ref={(m) => {
              beams.current[i] = m;
            }}
            color={GOLD}
            transparent
            opacity={0.06}
            blending={AdditiveBlending}
            depthWrite={false}
            side={DoubleSide}
            fog={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function Terrain() {
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(100, 140, 160, 224);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -18);
    const pos = g.attributes.position;
    const colors: number[] = [];
    const low = new Color("#5b5947");
    const high = new Color("#3a372f");
    const c = new Color();
    for (let i = 0; i < pos.count; i++) {
      const h = groundAt(pos.getX(i), pos.getZ(i));
      pos.setY(i, h);
      c.copy(low).lerp(high, Math.min(1, h / 3));
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors flatShading roughness={1} />
    </mesh>
  );
}

function useTrail() {
  return useMemo(() => {
    const first = SHRINES[0];
    const [fx, fz] = front(first);
    const [sx, sz] = stopOf(first, 0);
    const pts = [new Vector3(sx + fx * 10, 0, sz + fz * 10), ...SHRINES.map((s, i) => new Vector3(stopOf(s, i)[0], 0, stopOf(s, i)[1]))];
    pts.forEach((p) => (p.y = groundAt(p.x, p.z)));
    return new CatmullRomCurve3(pts, false, "centripetal");
  }, []);
}

/** Ruínas espalhadas: colunas em pé, tombadas e arcos partidos. */
function Ruins({ trail }: { trail: CatmullRomCurve3 }) {
  const cols = useRef<InstancedMesh>(null);
  const blocks = useRef<InstancedMesh>(null);
  const items = useMemo(() => {
    const samples = Array.from({ length: 120 }, (_, i) => trail.getPoint(i / 119));
    let s = 41;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const list: { x: number; z: number; h: number; fallen: boolean; rot: number }[] = [];
    for (let k = 0; k < 600 && list.length < 120; k++) {
      const x = (r() - 0.5) * 70;
      const z = 32 - r() * 100;
      const near = samples.some((p) => Math.hypot(p.x - x, p.z - z) < 3.5);
      const shrine = SHRINES.some((sh) => Math.hypot(sh.x - x, sh.z - z) < 6 + sh.size * 2);
      const sight = SHRINES.some((sh) => {
        const [fx, fz] = front(sh);
        const along = (x - sh.x) * fx + (z - sh.z) * fz;
        const across = Math.abs((x - sh.x) * fz - (z - sh.z) * fx);
        return along > 0 && along < cameraDistance(sh) + 3 && across < 5 + sh.size * 1.5;
      });
      if (!near && !shrine && !sight) list.push({ x, z, h: 1 + r() * 3.5, fallen: r() < 0.35, rot: r() * Math.PI });
    }
    return list;
  }, [trail]);
  useEffect(() => {
    const o = new Object3D();
    items.forEach((it, i) => {
      const y = groundAt(it.x, it.z);
      if (it.fallen) {
        o.position.set(it.x, y + 0.35, it.z);
        o.rotation.set(Math.PI / 2, it.rot, 0);
      } else {
        o.position.set(it.x, y + it.h / 2, it.z);
        o.rotation.set(0, it.rot, 0);
      }
      o.scale.set(1, it.h, 1);
      o.updateMatrix();
      cols.current?.setMatrixAt(i, o.matrix);
      o.position.set(it.x + 0.8, y + 0.2, it.z - 0.5);
      o.rotation.set(0.2, it.rot * 2, 0.1);
      o.scale.set(0.9, 0.4, 0.7);
      o.updateMatrix();
      blocks.current?.setMatrixAt(i, o.matrix);
    });
    for (const m of [cols.current, blocks.current]) if (m) m.instanceMatrix.needsUpdate = true;
  }, [items]);
  return (
    <>
      <instancedMesh ref={cols} args={[undefined, undefined, items.length]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.36, 1, 8]} />
        <meshStandardMaterial color={STONE} flatShading roughness={1} />
      </instancedMesh>
      <instancedMesh ref={blocks} args={[undefined, undefined, items.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={STONE_DARK} flatShading roughness={1} />
      </instancedMesh>
    </>
  );
}

function Mat({ color }: { color: string }) {
  return <meshStandardMaterial color={color} flatShading roughness={1} />;
}

/** Luz do santuário: um fragmento dourado que acende quando a jornada chega. */
function ShrineLight({ index, y }: { index: number; y: number }) {
  const shard = useRef<Mesh>(null);
  const light = useRef<PointLight>(null);
  const halo = useRef<MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const r = reachOf(index);
    const t = journey.reduced ? 0 : clock.elapsedTime;
    if (shard.current) {
      shard.current.position.y = y + Math.sin(t * 1.4 + index) * 0.12;
      shard.current.rotation.y = t * 0.8;
      shard.current.scale.setScalar(0.6 + r * 0.5);
    }
    if (light.current) light.current.intensity = r * (9 + Math.sin(t * 3) * 1.2) + journey.impulse * 6;
    if (halo.current) halo.current.opacity = 0.05 + r * 0.25;
  });
  return (
    <group>
      <mesh ref={shard} position-y={y}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshBasicMaterial color={GOLD.clone().multiplyScalar(3.2)} toneMapped={false} />
      </mesh>
      <mesh position-y={y} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.1, 1.4, 32]} />
        <meshBasicMaterial ref={halo} color={GOLD} transparent opacity={0.05} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
      </mesh>
      <pointLight ref={light} position-y={y} color="#ffcf7a" intensity={0} distance={11} decay={1.5} />
    </group>
  );
}

function Candles() {
  return (
    <group>
      {[
        [-0.5, 0.4],
        [0.4, 0.55],
        [0.1, 0.8],
        [-0.25, 0.9],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position-y={0.15 + i * 0.03}>
            <cylinderGeometry args={[0.05, 0.05, 0.3 + i * 0.06, 6]} />
            <meshStandardMaterial color="#d9cdb0" />
          </mesh>
          <mesh position-y={0.36 + i * 0.06}>
            <coneGeometry args={[0.03, 0.09, 5]} />
            <meshBasicMaterial color={GOLD.clone().multiplyScalar(3)} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Os santuários, todos com a fachada virada para +z local. */
function Structure({ kind, index }: { kind: Shrine["kind"]; index: number }) {
  const { skills } = useContent();
  const relics = useRef<Group>(null);
  const mist = useRef<MeshBasicMaterial>(null);
  const pillar = useRef<MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const t = journey.reduced ? 0 : clock.elapsedTime;
    if (relics.current) relics.current.rotation.y = t * 0.15;
    if (mist.current) mist.current.opacity = 0.2 + Math.sin(t * 1.3) * 0.05;
    if (pillar.current) pillar.current.opacity = 0.1 + reachOf(index) * 0.22 + Math.sin(t * 0.8) * 0.03;
  });

  switch (kind) {
    case "votive":
      return (
        <group>
          <mesh position-y={1.3} castShadow>
            <boxGeometry args={[0.9, 2.6, 0.45]} />
            <Mat color={STONE} />
          </mesh>
          <mesh position={[0, 2.75, 0]} castShadow>
            <coneGeometry args={[0.55, 0.5, 4]} />
            <Mat color={STONE_DARK} />
          </mesh>
          <mesh position={[0, 1.6, 0.235]}>
            <ringGeometry args={[0.18, 0.24, 6]} />
            <meshBasicMaterial color={GOLD.clone().multiplyScalar(1.8)} toneMapped={false} />
          </mesh>
          <Candles />
          <ShrineLight index={index} y={3.6} />
        </group>
      );
    case "chapel":
      return (
        <group>
          {[-1.3, 1.3].map((x) => (
            <mesh key={x} position={[x, 1.6, 0]} castShadow>
              <boxGeometry args={[0.6, 3.2, 3]} />
              <Mat color={STONE} />
            </mesh>
          ))}
          <mesh position={[0, 3.35, 0]} castShadow>
            <boxGeometry args={[3.2, 0.5, 3]} />
            <Mat color={STONE_DARK} />
          </mesh>
          <mesh position={[-0.6, 4.1, 0]} rotation-z={0.6} castShadow>
            <boxGeometry args={[2, 0.3, 3]} />
            <Mat color={STONE_DARK} />
          </mesh>
          <mesh position={[0, 1.4, -1.45]}>
            <planeGeometry args={[2, 2.8]} />
            <meshStandardMaterial color="#1c1a16" />
          </mesh>
          <Candles />
          <ShrineLight index={index} y={2} />
        </group>
      );
    case "watchtower":
      return (
        <group>
          <mesh position-y={3} castShadow>
            <cylinderGeometry args={[1.1, 1.4, 6, 8]} />
            <Mat color={STONE} />
          </mesh>
          <mesh position={[0.3, 6.6, 0]} rotation-z={0.25} castShadow>
            <cylinderGeometry args={[0.9, 1.1, 1.6, 8]} />
            <Mat color={STONE_DARK} />
          </mesh>
          <mesh position={[0, 1.1, 1.3]}>
            <planeGeometry args={[0.8, 1.6]} />
            <meshStandardMaterial color="#1c1a16" />
          </mesh>
          <ShrineLight index={index} y={7.9} />
        </group>
      );
    case "gate":
      // Grande portão selado por névoa dourada.
      return (
        <group>
          {[-2.6, 2.6].map((x) => (
            <mesh key={x} position={[x, 3.2, 0]} castShadow>
              <boxGeometry args={[1.4, 6.4, 1.6]} />
              <Mat color={STONE} />
            </mesh>
          ))}
          <mesh position={[0, 6.8, 0]} castShadow>
            <boxGeometry args={[6.8, 1, 1.8]} />
            <Mat color={STONE_DARK} />
          </mesh>
          <mesh position={[0, 7.7, 0]} castShadow>
            <coneGeometry args={[1.2, 1.4, 3]} />
            <Mat color={STONE_DARK} />
          </mesh>
          <mesh position={[0, 3.15, 0]}>
            <planeGeometry args={[3.8, 6.3]} />
            <meshBasicMaterial ref={mist} color={GOLD} transparent opacity={0.22} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
          </mesh>
          <ShrineLight index={index} y={8.9} />
        </group>
      );
    case "cathedral":
      return (
        <group>
          <mesh position={[0, 3, -1]} castShadow receiveShadow>
            <boxGeometry args={[5, 6, 6]} />
            <Mat color={STONE} />
          </mesh>
          <mesh position={[0, 6.6, -1]} rotation-y={Math.PI / 4} castShadow>
            <coneGeometry args={[3.9, 2.6, 4]} />
            <Mat color={STONE_DARK} />
          </mesh>
          {[-2.2, 2.2].map((x) => (
            <group key={x} position={[x, 0, 2.2]}>
              <mesh position-y={4.5} castShadow>
                <boxGeometry args={[1.3, 9, 1.3]} />
                <Mat color={STONE} />
              </mesh>
              <mesh position-y={10} castShadow>
                <coneGeometry args={[0.95, 2.4, 4]} />
                <Mat color={STONE_DARK} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 2.3, 2.01]}>
            <planeGeometry args={[2, 4.6]} />
            <meshBasicMaterial color={GOLD.clone().multiplyScalar(0.9)} toneMapped={false} />
          </mesh>
          <mesh position={[0, 4.6, 2.02]}>
            <circleGeometry args={[0.8, 16]} />
            <meshBasicMaterial color={GOLD.clone().multiplyScalar(1.6)} toneMapped={false} />
          </mesh>
          {/* Pilar de luz: a missão em andamento. */}
          <mesh position={[0, 30, -1]}>
            <cylinderGeometry args={[0.9, 1.6, 60, 16, 1, true]} />
            <meshBasicMaterial ref={pillar} color={GOLD} transparent opacity={0.2} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
          </mesh>
          <ShrineLight index={index} y={3.2} />
        </group>
      );
    case "reliquary":
      // Relicário: uma tábua rúnica por skill, flutuando, com o tamanho do nível.
      return (
        <group>
          <mesh position-y={0.5} castShadow>
            <cylinderGeometry args={[1.2, 1.4, 1, 8]} />
            <Mat color={STONE_DARK} />
          </mesh>
          <group ref={relics} position-y={2.3}>
            {skills.map((s, i) => {
              const a = (i / skills.length) * Math.PI * 2;
              const h = 0.5 + (s.value / 100) * 1.3;
              return (
                <group key={s.label} position={[Math.sin(a) * 2.2, Math.sin(i * 1.7) * 0.3, Math.cos(a) * 2.2]} rotation-y={a}>
                  <mesh castShadow>
                    <boxGeometry args={[0.5, h, 0.1]} />
                    <Mat color={STONE} />
                  </mesh>
                  <mesh position-z={0.055}>
                    <planeGeometry args={[0.1, h * 0.7]} />
                    <meshBasicMaterial color={GOLD.clone().multiplyScalar(2.4)} toneMapped={false} />
                  </mesh>
                </group>
              );
            })}
          </group>
          <ShrineLight index={index} y={2.3} />
        </group>
      );
    case "sigil":
      // Círculo de invocação: o contato.
      return (
        <group>
          <mesh position-y={0.4} castShadow>
            <boxGeometry args={[1.4, 0.8, 0.8]} />
            <Mat color={STONE_DARK} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 2.4]}>
            <ringGeometry args={[1.5, 1.6, 64]} />
            <meshBasicMaterial color={GOLD.clone().multiplyScalar(2.2)} toneMapped={false} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 2.4]}>
            <ringGeometry args={[0.9, 0.95, 6]} />
            <meshBasicMaterial color={GOLD.clone().multiplyScalar(2)} toneMapped={false} />
          </mesh>
          <Candles />
          <ShrineLight index={index} y={2.2} />
        </group>
      );
  }
}

function ShrineMesh({ shrine, index }: { shrine: Shrine; index: number }) {
  const y = groundAt(shrine.x, shrine.z);
  return (
    <group position={[shrine.x, y, shrine.z]} rotation-y={shrine.facing}>
      <group scale={0.75 + shrine.size * 0.3}>
        <Structure kind={shrine.kind} index={index} />
      </group>
    </group>
  );
}

/** Fragmentos de luz guiando pela trilha até o próximo santuário. */
function Guidance({ trail }: { trail: CatmullRomCurve3 }) {
  const ref = useRef<InstancedMesh>(null);
  const COUNT = 60;
  const o = useMemo(() => new Object3D(), []);
  const p = useMemo(() => new Vector3(), []);
  useFrame(({ clock }) => {
    const n = SHRINES.length;
    const here = Math.min(1, Math.max(0, journey.smooth / n));
    const next = Math.min(1, (Math.floor(journey.smooth) + 1) / n);
    const t = journey.reduced ? 0 : clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      const f = ((i / COUNT + t * 0.05) % 1);
      const u = here + (Math.max(next, here + 0.02) - here) * f;
      trail.getPoint(Math.min(1, u), p);
      o.position.set(p.x + Math.sin(i * 7.1) * 0.4, groundAt(p.x, p.z) + 0.5 + Math.sin(t * 2 + i) * 0.15, p.z + Math.cos(i * 5.3) * 0.4);
      o.scale.setScalar(Math.sin(f * Math.PI) * 1.1);
      o.updateMatrix();
      ref.current?.setMatrixAt(i, o.matrix);
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshBasicMaterial color={GOLD.clone().multiplyScalar(3)} toneMapped={false} />
    </instancedMesh>
  );
}

/** Cinzas caindo devagar. */
function Ash() {
  const ref = useRef<InstancedMesh>(null);
  const COUNT = 500;
  const flakes = useMemo(() => {
    let s = 9;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: COUNT }, () => ({ x: (r() - 0.5) * 60, y: r() * 16, z: 30 - r() * 95, v: 0.2 + r() * 0.4, p: r() * 10 }));
  }, []);
  const o = useMemo(() => new Object3D(), []);
  useFrame(({ clock }, delta) => {
    const dt = journey.reduced ? 0 : Math.min(delta, 0.1);
    const t = clock.elapsedTime;
    flakes.forEach((f, i) => {
      f.y -= dt * f.v;
      if (f.y < 0) f.y = 16;
      o.position.set(f.x + Math.sin(t * 0.5 + f.p) * 0.6, f.y, f.z);
      o.rotation.set(t + f.p, t * 0.7, 0);
      o.updateMatrix();
      ref.current?.setMatrixAt(i, o.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <planeGeometry args={[0.05, 0.05]} />
      <meshBasicMaterial color="#cfc6b2" transparent opacity={0.6} side={DoubleSide} />
    </instancedMesh>
  );
}

function ImpulseDecay() {
  useFrame((_, delta) => {
    journey.impulse = Math.max(0, journey.impulse - Math.min(delta, 0.1) * 1.4);
  });
  return null;
}

/** Câmera de frente para cada santuário, com ele do lado oposto ao cartão. */
function buildKeys(): CameraKey[] {
  const up = new Vector3(0, 1, 0);
  return [
    { pos: [6, 16, 48], look: [-4, 4, -10] },
    ...SHRINES.map((s, i): CameraKey => {
      const [fx, fz] = front(s);
      const f = new Vector3(fx, 0, fz);
      const base = new Vector3(s.x, groundAt(s.x, s.z), s.z);
      const height = s.kind === "cathedral" ? 7.5 : s.kind === "gate" ? 4 : s.kind === "watchtower" ? 3.8 : 2.4;
      const pos = base.clone().addScaledVector(f, cameraDistance(s)).add(new Vector3(0, height + s.size * 0.6, 0));
      const right = f.clone().negate().cross(up).normalize();
      const side = SOMBRIO_ALIGN[i + 1] === "left" ? -1 : 1;
      const look = base.clone().add(new Vector3(0, height * 0.8, 0)).addScaledVector(right, side * (1.8 + s.size * 1.1));
      return { pos: [pos.x, pos.y, pos.z], look: [look.x, look.y, look.z] };
    }),
  ];
}

/** Terras sombrias: fantasia sombria original, de santuário em santuário. */
export default function SombrioScene(props: WorldSceneProps) {
  const trail = useTrail();
  const keys = useMemo(() => buildKeys(), []);
  useEffect(() => {
    const el = props.eventSource.current;
    if (!el || props.reduced) return;
    const down = (e: PointerEvent) => {
      if (e.target instanceof Element && e.target.closest("a, button")) return;
      journey.impulse = 1;
    };
    el.addEventListener("pointerdown", down);
    return () => el.removeEventListener("pointerdown", down);
  }, [props.eventSource, props.reduced]);

  return (
    <WorldCanvas {...props} background={BG} fov={42} shadows>
      <ImpulseDecay />
      <fogExp2 attach="fog" args={[FOG, 0.022]} />
      <Sky />
      <DistantSpire />
      <hemisphereLight args={["#bfae86", "#1d1a14", 0.65]} />
      <directionalLight
        position={[-25, 30, -40]}
        intensity={1.3}
        color="#ffd9a0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-far={140}
      />
      <CameraRig keys={keys} parallax={[0.7, 0.35]} follow={2.4} />
      <Terrain />
      <Ruins trail={trail} />
      {SHRINES.map((s, i) => (
        <ShrineMesh key={s.kind} shrine={s} index={i} />
      ))}
      <Guidance trail={trail} />
      <Ash />
      {!props.device.low && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.25} intensity={1} radius={0.8} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette darkness={0.75} offset={0.2} />
          <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
        </EffectComposer>
      )}
    </WorldCanvas>
  );
}
