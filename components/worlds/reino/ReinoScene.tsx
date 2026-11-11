"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import {
  BackSide,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  type Group,
  type InstancedMesh,
  type Mesh,
  Object3D,
  PlaneGeometry,
  type PointLight,
  SRGBColorSpace,
  Vector3,
} from "three";
import { useContent } from "@/lib/preferences";
import CameraRig, { type CameraKey } from "../engine/CameraRig";
import { journey } from "../engine/journey";
import WorldCanvas from "../engine/WorldCanvas";
import type { WorldSceneProps } from "../engine/types";
import { MONUMENTS, REINO_ALIGN, cameraDistance, front, groundAt, stopOf, type Monument } from "./layout";

const BG = "#070a17";
const STONE = "#8a8478";
const STONE_DARK = "#5f5a52";
const WOOD = "#5a3d26";
const SLATE = "#39404d";
const ROOF_RED = "#7a2f24";
const CRIMSON = "#8b1e2d";
const GOLD = new Color("#d4a54a");
const FIRE = new Color("#ff9a3c");


function Sky() {
  const args = useMemo(
    () => ({
      uniforms: { top: { value: new Color("#05070f") }, mid: { value: new Color("#1b2240") }, low: { value: new Color("#b0603a") } },
      vertexShader: `varying vec3 vPos; void main(){ vPos = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 low; varying vec3 vPos;
        void main(){ float h = vPos.y; vec3 c = h > 0.08 ? mix(mid, top, smoothstep(0.08, 0.6, h)) : mix(low, mid, smoothstep(-0.05, 0.08, h));
        gl_FragColor = vec4(c, 1.0); }`,
    }),
    [],
  );
  const stars = useMemo(() => {
    let s = 21;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const arr = new Float32Array(1600 * 3);
    for (let i = 0; i < 1600; i++) {
      const u = r() * Math.PI * 2;
      const v = Math.acos(0.15 + r() * 0.85);
      arr[i * 3] = Math.sin(v) * Math.cos(u) * 140;
      arr[i * 3 + 1] = Math.cos(v) * 140;
      arr[i * 3 + 2] = Math.sin(v) * Math.sin(u) * 140;
    }
    return arr;
  }, []);
  return (
    <>
      <mesh scale={160}>
        <sphereGeometry args={[1, 32, 16]} />
        <shaderMaterial args={[args]} side={BackSide} depthWrite={false} fog={false} />
      </mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stars, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#f3ead2" size={0.5} sizeAttenuation transparent opacity={0.8} fog={false} />
      </points>
      <mesh position={[-60, 55, -110]}>
        <sphereGeometry args={[5, 24, 24]} />
        <meshBasicMaterial color={new Color("#f4ecd6").multiplyScalar(1.6)} toneMapped={false} fog={false} />
      </mesh>
    </>
  );
}

/** Terreno com colinas, cores por altura (vale mais claro, morros mais escuros). */
function Terrain() {
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(90, 130, 150, 216);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -19);
    const pos = g.attributes.position;
    const colors: number[] = [];
    const low = new Color("#3a5a32");
    const high = new Color("#1f3322");
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

/** A estrada: lajes de pedra ligando as paradas diante dos monumentos. */
function useRoad() {
  return useMemo(() => {
    const first = MONUMENTS[0];
    const [fx, fz] = front(first);
    const [sx, sz] = stopOf(first, 0);
    const pts = [new Vector3(sx + fx * 9, 0, sz + fz * 9), ...MONUMENTS.map((m, i) => new Vector3(stopOf(m, i)[0], 0, stopOf(m, i)[1]))];
    pts.forEach((p) => (p.y = groundAt(p.x, p.z)));
    return new CatmullRomCurve3(pts, false, "centripetal");
  }, []);
}

function Road({ curve }: { curve: CatmullRomCurve3 }) {
  const ref = useRef<InstancedMesh>(null);
  const COUNT = 420;
  useEffect(() => {
    const o = new Object3D();
    let s = 3;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < COUNT; i++) {
      const t = i / (COUNT - 1);
      const p = curve.getPoint(t);
      const tan = curve.getTangent(t);
      const side = new Vector3(-tan.z, 0, tan.x).normalize();
      p.addScaledVector(side, (r() - 0.5) * 1.6);
      p.y = groundAt(p.x, p.z) + 0.03;
      o.position.copy(p);
      o.rotation.set(0, r() * Math.PI, 0);
      o.scale.set(0.6 + r() * 0.5, 1, 0.5 + r() * 0.4);
      o.updateMatrix();
      ref.current?.setMatrixAt(i, o.matrix);
    }
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [curve]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} receiveShadow>
      <cylinderGeometry args={[0.5, 0.55, 0.08, 6]} />
      <meshStandardMaterial color="#9a8f7c" flatShading roughness={1} />
    </instancedMesh>
  );
}

/** Pinheiros espalhados, longe da estrada e dos monumentos. */
function Forest({ curve }: { curve: CatmullRomCurve3 }) {
  const trunks = useRef<InstancedMesh>(null);
  const crowns = useRef<InstancedMesh>(null);
  const trees = useMemo(() => {
    const samples = Array.from({ length: 120 }, (_, i) => curve.getPoint(i / 119));
    const list: { x: number; z: number; s: number }[] = [];
    let s = 77;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let k = 0; k < 900 && list.length < 260; k++) {
      const x = (r() - 0.5) * 80;
      const z = 30 - r() * 100;
      const nearRoad = samples.some((p) => Math.hypot(p.x - x, p.z - z) < 4.5);
      const nearMonument = MONUMENTS.some((m) => Math.hypot(m.x - x, m.z - z) < 6 + m.size * 2.5);
      // Nada entre a câmera e o monumento: corredor livre ao longo da linha de visão.
      const inSight = MONUMENTS.some((m) => {
        const [fx, fz] = front(m);
        const along = (x - m.x) * fx + (z - m.z) * fz;
        const across = Math.abs((x - m.x) * fz - (z - m.z) * fx);
        return along > 0 && along < cameraDistance(m) + 3 && across < 5 + m.size * 1.5;
      });
      if (!nearRoad && !nearMonument && !inSight) list.push({ x, z, s: 0.8 + r() * 0.9 });
    }
    return list;
  }, [curve]);
  useEffect(() => {
    const o = new Object3D();
    trees.forEach((t, i) => {
      const y = groundAt(t.x, t.z);
      o.position.set(t.x, y + 0.5 * t.s, t.z);
      o.scale.setScalar(t.s);
      o.rotation.set(0, i, 0);
      o.updateMatrix();
      trunks.current?.setMatrixAt(i, o.matrix);
      o.position.set(t.x, y + 1.9 * t.s, t.z);
      o.updateMatrix();
      crowns.current?.setMatrixAt(i, o.matrix);
    });
    if (trunks.current) trunks.current.instanceMatrix.needsUpdate = true;
    if (crowns.current) crowns.current.instanceMatrix.needsUpdate = true;
  }, [trees]);
  return (
    <>
      <instancedMesh ref={trunks} args={[undefined, undefined, trees.length]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1, 5]} />
        <meshStandardMaterial color="#3b2a1c" flatShading />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, trees.length]} castShadow>
        <coneGeometry args={[0.85, 2.6, 6]} />
        <meshStandardMaterial color="#1d3b2a" flatShading roughness={0.9} />
      </instancedMesh>
    </>
  );
}

function Mat({ color, ...rest }: { color: string } & Record<string, unknown>) {
  return <meshStandardMaterial color={color} flatShading roughness={0.9} {...rest} />;
}

/** Chama: emissivo + luz que tremula. */
function Flame({ position, scale = 1, light = true }: { position: [number, number, number]; scale?: number; light?: boolean }) {
  const mesh = useRef<Mesh>(null);
  const lamp = useRef<PointLight>(null);
  const seed = useMemo(() => Math.random() * 10, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed;
    const flicker = journey.reduced ? 1 : 0.85 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.07;
    mesh.current?.scale.set(scale, scale * flicker * 1.2, scale);
    if (lamp.current) lamp.current.intensity = 7 * flicker * scale;
  });
  return (
    <group position={position}>
      <mesh ref={mesh}>
        <coneGeometry args={[0.12, 0.38, 6]} />
        <meshBasicMaterial color={FIRE.clone().multiplyScalar(3.2)} toneMapped={false} />
      </mesh>
      {light && <pointLight ref={lamp} color="#ff9a3c" intensity={7} distance={9} decay={1.6} />}
    </group>
  );
}

function Banner({ position, color = CRIMSON, height = 1 }: { position: [number, number, number]; color?: string; height?: number }) {
  const cloth = useRef<Mesh>(null);
  const seed = useMemo(() => Math.random() * 10, []);
  useFrame(({ clock }) => {
    if (cloth.current && !journey.reduced) cloth.current.rotation.y = Math.sin(clock.elapsedTime * 1.6 + seed) * 0.18;
  });
  return (
    <group position={position}>
      <mesh position-y={height * 0.5} castShadow>
        <cylinderGeometry args={[0.03, 0.03, height, 5]} />
        <Mat color={WOOD} />
      </mesh>
      <mesh ref={cloth} position={[0.22, height * 0.72, 0]}>
        <planeGeometry args={[0.42, height * 0.5]} />
        <meshStandardMaterial color={color} side={DoubleSide} flatShading />
      </mesh>
    </group>
  );
}

function Ameias({ w, d, y }: { w: number; d: number; y: number }) {
  const blocks: ReactNode[] = [];
  const step = 0.45;
  for (let x = -w / 2; x <= w / 2 + 0.01; x += step * 2) {
    blocks.push(<mesh key={`f${x}`} position={[x, y, d / 2]} castShadow><boxGeometry args={[step, 0.3, 0.3]} /><Mat color={STONE} /></mesh>);
    blocks.push(<mesh key={`b${x}`} position={[x, y, -d / 2]} castShadow><boxGeometry args={[step, 0.3, 0.3]} /><Mat color={STONE} /></mesh>);
  }
  return <>{blocks}</>;
}

/** Os monumentos, todos com a fachada virada para +z local. */
function Structure({ kind }: { kind: Monument["kind"] }) {
  const { skills } = useContent();
  const sails = useRef<Group>(null);
  useFrame((_, delta) => {
    if (sails.current && !journey.reduced) sails.current.rotation.z += Math.min(delta, 0.1) * 0.6;
  });

  switch (kind) {
    case "forge":
      // Forja: a eletrônica como ofício (a origem técnica).
      return (
        <group>
          <mesh position={[0, 1, -0.4]} castShadow receiveShadow>
            <boxGeometry args={[3, 2, 2]} />
            <Mat color={STONE_DARK} />
          </mesh>
          <mesh position={[0, 2.35, -0.4]} rotation-y={Math.PI / 4} castShadow>
            <coneGeometry args={[2.3, 1.1, 4]} />
            <Mat color={SLATE} />
          </mesh>
          <mesh position={[0.9, 2.9, -0.9]} castShadow>
            <boxGeometry args={[0.45, 1.6, 0.45]} />
            <Mat color={STONE} />
          </mesh>
          <mesh position={[0, 0.7, 0.61]}>
            <planeGeometry args={[1.2, 1]} />
            <meshBasicMaterial color={FIRE.clone().multiplyScalar(2)} toneMapped={false} />
          </mesh>
          <group position={[0.2, 0, 1.6]}>
            <mesh position-y={0.3} castShadow>
              <boxGeometry args={[0.35, 0.6, 0.35]} />
              <Mat color={WOOD} />
            </mesh>
            <mesh position-y={0.68} castShadow>
              <boxGeometry args={[0.8, 0.18, 0.32]} />
              <meshStandardMaterial color="#3d3f44" metalness={0.8} roughness={0.35} flatShading />
            </mesh>
          </group>
          <Flame position={[0, 0.9, 0.9]} scale={1.3} />
        </group>
      );
    case "windmill":
      return (
        <group>
          <mesh position-y={1.8} castShadow>
            <cylinderGeometry args={[0.9, 1.3, 3.6, 8]} />
            <Mat color="#c9bba0" />
          </mesh>
          <mesh position-y={4} castShadow>
            <coneGeometry args={[1.15, 1.2, 8]} />
            <Mat color={ROOF_RED} />
          </mesh>
          <group ref={sails} position={[0, 3.5, 1.1]}>
            {[0, 1, 2, 3].map((i) => (
              <group key={i} rotation-z={(i * Math.PI) / 2}>
                <mesh position={[0, 1.4, 0]} castShadow>
                  <boxGeometry args={[0.55, 2.6, 0.05]} />
                  <Mat color="#d8ccb0" />
                </mesh>
              </group>
            ))}
            <mesh rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.18, 0.18, 0.3, 8]} />
              <Mat color={WOOD} />
            </mesh>
          </group>
          <mesh position={[0, 0.6, 1.15]}>
            <boxGeometry args={[0.6, 1.1, 0.1]} />
            <Mat color={WOOD} />
          </mesh>
          <Flame position={[0.7, 1.3, 1.3]} />
        </group>
      );
    case "tower":
      return (
        <group>
          <mesh position-y={2.6} castShadow>
            <cylinderGeometry args={[1.1, 1.35, 5.2, 8]} />
            <Mat color={STONE} />
          </mesh>
          <mesh position-y={6} castShadow>
            <coneGeometry args={[1.5, 2, 8]} />
            <Mat color={SLATE} />
          </mesh>
          {[1.6, 3, 4.3].map((y) => (
            <mesh key={y} position={[0, y, 1.25]}>
              <planeGeometry args={[0.32, 0.55]} />
              <meshBasicMaterial color={FIRE.clone().multiplyScalar(1.6)} toneMapped={false} />
            </mesh>
          ))}
          <Banner position={[0, 6.9, 0]} height={1.2} />
          <Flame position={[-0.8, 1.1, 1.4]} />
          <Flame position={[0.8, 1.1, 1.4]} light={false} />
        </group>
      );
    case "fortress":
      return (
        <group>
          <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[5, 2.8, 1.2]} />
            <Mat color={STONE} />
          </mesh>
          <Ameias w={5} d={1.2} y={2.95} />
          {[-2.6, 2.6].map((x) => (
            <group key={x} position={[x, 0, 0]}>
              <mesh position-y={2} castShadow>
                <cylinderGeometry args={[0.85, 0.95, 4, 8]} />
                <Mat color={STONE} />
              </mesh>
              <mesh position-y={4.5} castShadow>
                <coneGeometry args={[1.1, 1.4, 8]} />
                <Mat color={SLATE} />
              </mesh>
              <Banner position={[0, 5.1, 0]} height={1.1} />
            </group>
          ))}
          <mesh position={[0, 0.95, 0.61]}>
            <planeGeometry args={[1.5, 1.9]} />
            <meshStandardMaterial color="#120d09" />
          </mesh>
          {[-0.5, -0.17, 0.17, 0.5].map((x) => (
            <mesh key={x} position={[x, 1.05, 0.64]}>
              <boxGeometry args={[0.06, 1.7, 0.06]} />
              <meshStandardMaterial color="#2c2c30" metalness={0.8} roughness={0.4} />
            </mesh>
          ))}
          {/* Brasão: o escudo de risco (LiNe/B3). */}
          <mesh position={[0, 2.3, 0.62]}>
            <circleGeometry args={[0.38, 6]} />
            <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.3} emissive={GOLD} emissiveIntensity={0.3} />
          </mesh>
          <Flame position={[-1.1, 1.5, 0.9]} />
          <Flame position={[1.1, 1.5, 0.9]} light={false} />
        </group>
      );
    case "citadel":
      return (
        <group>
          <mesh position={[0, 1.6, -0.6]} castShadow receiveShadow>
            <boxGeometry args={[6, 3.2, 4]} />
            <Mat color="#9a9384" />
          </mesh>
          <Ameias w={6} d={4} y={3.35} />
          {[
            [-3, 1.4],
            [3, 1.4],
            [-3, -2.6],
            [3, -2.6],
          ].map(([x, z]) => (
            <group key={`${x}${z}`} position={[x, 0, z]}>
              <mesh position-y={2.4} castShadow>
                <cylinderGeometry args={[0.75, 0.85, 4.8, 8]} />
                <Mat color="#9a9384" />
              </mesh>
              <mesh position-y={5.4} castShadow>
                <coneGeometry args={[1, 1.4, 8]} />
                <Mat color={SLATE} />
              </mesh>
              <Banner position={[0, 6, 0]} color="#c8961f" height={1} />
            </group>
          ))}
          <mesh position={[0, 4.6, -0.8]} castShadow>
            <boxGeometry args={[2, 3, 2]} />
            <Mat color="#a59d8c" />
          </mesh>
          <mesh position={[0, 6.7, -0.8]} castShadow>
            <coneGeometry args={[1.6, 1.4, 4]} />
            <Mat color={SLATE} />
          </mesh>
          {/* Braseiro aceso: a fase atual. */}
          <mesh position={[0, 7.5, -0.8]}>
            <cylinderGeometry args={[0.35, 0.2, 0.3, 8]} />
            <meshStandardMaterial color="#2c2c30" metalness={0.8} />
          </mesh>
          <Flame position={[0, 7.85, -0.8]} scale={2.2} />
          <mesh position={[0, 1.2, 1.41]}>
            <planeGeometry args={[1.6, 2.2]} />
            <meshStandardMaterial color="#120d09" />
          </mesh>
          <Flame position={[-1.2, 1.6, 1.8]} />
          <Flame position={[1.2, 1.6, 1.8]} light={false} />
        </group>
      );
    case "runestones":
      // Círculo de pedras rúnicas: uma por skill, a altura é o nível; as runas acendem.
      return (
        <group>
          {skills.map((s, i) => {
            const a = (i / skills.length) * Math.PI * 2;
            const h = 0.8 + (s.value / 100) * 2.6;
            return (
              <group key={s.label} position={[Math.sin(a) * 2.6, 0, Math.cos(a) * 2.6]} rotation-y={a}>
                <mesh position-y={h / 2} castShadow>
                  <boxGeometry args={[0.55, h, 0.3]} />
                  <Mat color={STONE_DARK} />
                </mesh>
                <mesh position={[0, h * 0.6, 0.16]}>
                  <planeGeometry args={[0.12, h * 0.5]} />
                  <meshBasicMaterial color={(s.tone === "signal" ? new Color("#7fd6ff") : GOLD).clone().multiplyScalar(2.2)} toneMapped={false} />
                </mesh>
              </group>
            );
          })}
          <mesh position-y={0.4} castShadow>
            <cylinderGeometry args={[0.7, 0.8, 0.8, 8]} />
            <Mat color={STONE} />
          </mesh>
          <mesh position-y={1.2}>
            <octahedronGeometry args={[0.3, 0]} />
            <meshBasicMaterial color={GOLD.clone().multiplyScalar(2.6)} toneMapped={false} />
          </mesh>
        </group>
      );
    case "questboard":
      // Quadro de missões da taverna: o contato.
      return (
        <group>
          <mesh position={[0, 1.5, -2.2]} castShadow>
            <boxGeometry args={[4, 3, 2.6]} />
            <Mat color="#7a6a55" />
          </mesh>
          <mesh position={[0, 3.5, -2.2]} rotation-y={Math.PI / 4} castShadow>
            <coneGeometry args={[3, 1.4, 4]} />
            <Mat color={ROOF_RED} />
          </mesh>
          {[-1.1, 1.1].map((x) => (
            <mesh key={x} position={[x, 1.6, -0.89]}>
              <planeGeometry args={[0.6, 0.6]} />
              <meshBasicMaterial color={FIRE.clone().multiplyScalar(1.4)} toneMapped={false} />
            </mesh>
          ))}
          <mesh position={[0, 1.3, 0.6]} castShadow>
            <boxGeometry args={[2.2, 1.4, 0.12]} />
            <Mat color={WOOD} />
          </mesh>
          {[-0.65, 0, 0.6].map((x, i) => (
            <mesh key={x} position={[x, 1.32 + (i % 2) * 0.12, 0.67]} rotation-z={(i - 1) * 0.08}>
              <planeGeometry args={[0.5, 0.65]} />
              <meshStandardMaterial color="#e8d9b5" />
            </mesh>
          ))}
          {[-1, 1].map((x) => (
            <mesh key={x} position={[x * 1.05, 0.65, 0.6]} castShadow>
              <boxGeometry args={[0.12, 1.3, 0.12]} />
              <Mat color={WOOD} />
            </mesh>
          ))}
          <Flame position={[1.4, 1.9, 0.8]} />
        </group>
      );
  }
}

function makePlaque(label: string, sub: string) {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 192;
  const g = c.getContext("2d")!;
  g.fillStyle = "#3d3a35";
  g.fillRect(0, 0, 768, 192);
  g.strokeStyle = "#d4a54a";
  g.lineWidth = 6;
  g.strokeRect(14, 14, 740, 164);
  g.fillStyle = "#e9d7a8";
  g.textAlign = "center";
  g.font = `600 ${label.length > 10 ? 60 : 74}px serif`;
  g.fillText(label, 384, sub ? 104 : 118);
  if (sub) {
    g.font = "500 40px serif";
    g.fillStyle = "#c9a35a";
    g.fillText(sub, 384, 156);
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Monumento no lugar, com a placa de pedra gravada diante da fachada. */
function MonumentMesh({ monument }: { monument: Monument }) {
  const plaque = useMemo(() => makePlaque(monument.label, monument.sub), [monument]);
  useEffect(() => () => plaque.dispose(), [plaque]);
  const y = groundAt(monument.x, monument.z);
  const scale = 0.7 + monument.size * 0.35;
  return (
    <group position={[monument.x, y, monument.z]} rotation-y={monument.facing}>
      <group scale={scale}>
        <Structure kind={monument.kind} />
      </group>
      <group position={[monument.kind === "questboard" ? -1.9 : 0, 0, 2.2 + monument.size * 0.9]}>
        <mesh position-y={0.35} castShadow>
          <boxGeometry args={[1.9, 0.7, 0.25]} />
          <Mat color={STONE_DARK} />
        </mesh>
        <mesh position={[0, 0.38, 0.13]}>
          <planeGeometry args={[1.8, 0.45]} />
          <meshStandardMaterial map={plaque} roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

/** O cavaleiro: avança pela estrada com o scroll, com lanterna. */
function Knight({ curve }: { curve: CatmullRomCurve3 }) {
  const root = useRef<Group>(null);
  const tmp = useMemo(() => ({ p: new Vector3(), q: new Vector3() }), []);
  useFrame(({ clock }) => {
    const n = MONUMENTS.length;
    const t = Math.min(1, Math.max(0, journey.smooth / n));
    curve.getPoint(t, tmp.p);
    curve.getPoint(Math.min(1, t + 0.004), tmp.q);
    const g = root.current;
    if (!g) return;
    const moving = Math.abs(journey.smooth - Math.round(journey.smooth)) > 0.06;
    const step = journey.reduced || !moving ? 0 : Math.abs(Math.sin(clock.elapsedTime * 9)) * 0.08;
    g.position.set(tmp.p.x, groundAt(tmp.p.x, tmp.p.z) + step, tmp.p.z);
    // Parado diante do monumento, vira para ele; andando, olha para a frente.
    const at = Math.round(journey.smooth) - 1;
    if (!moving && at >= 0 && at < n) {
      const m = MONUMENTS[at];
      g.lookAt(m.x, g.position.y, m.z);
    } else if (tmp.q.distanceToSquared(tmp.p) > 1e-6) g.lookAt(tmp.q.x, g.position.y, tmp.q.z);
    g.scale.setScalar(1 + journey.impulse * 0.15);
  });
  return (
    <group ref={root}>
      <mesh position-y={0.55} castShadow>
        <cylinderGeometry args={[0.2, 0.26, 0.7, 8]} />
        <meshStandardMaterial color="#9ea4ad" metalness={0.8} roughness={0.35} flatShading />
      </mesh>
      <mesh position-y={1.05} castShadow>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshStandardMaterial color="#b5bbc4" metalness={0.85} roughness={0.3} flatShading />
      </mesh>
      <mesh position={[0, 1.05, 0.16]}>
        <boxGeometry args={[0.2, 0.03, 0.04]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0.55, -0.24]} rotation-x={0.12}>
        <planeGeometry args={[0.5, 0.75]} />
        <meshStandardMaterial color={CRIMSON} side={DoubleSide} flatShading />
      </mesh>
      <mesh position={[0.27, 0.6, 0.05]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[0.36, 0.44, 0.05]} />
        <meshStandardMaterial color={CRIMSON} flatShading />
      </mesh>
      <mesh position={[0.3, 0.6, 0.05]} rotation-y={Math.PI / 2}>
        <circleGeometry args={[0.09, 6]} />
        <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.3} />
      </mesh>
      <Flame position={[-0.3, 0.75, 0.15]} scale={0.6} />
    </group>
  );
}

/** Vaga-lumes flutuando pelo vale. */
function Fireflies() {
  const ref = useRef<InstancedMesh>(null);
  const COUNT = 160;
  const flies = useMemo(() => {
    let s = 33;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: COUNT }, () => ({ x: (r() - 0.5) * 34, z: 26 - r() * 82, y: 0.6 + r() * 2.4, p: r() * 10 }));
  }, []);
  const o = useMemo(() => new Object3D(), []);
  useFrame(({ clock }) => {
    const t = journey.reduced ? 0 : clock.elapsedTime;
    flies.forEach((f, i) => {
      o.position.set(f.x + Math.sin(t * 0.4 + f.p) * 0.8, groundAt(f.x, f.z) + f.y + Math.sin(t * 0.9 + f.p) * 0.3, f.z + Math.cos(t * 0.3 + f.p) * 0.8);
      o.scale.setScalar(0.6 + Math.max(0, Math.sin(t * 2 + f.p * 3)) * 0.8);
      o.updateMatrix();
      ref.current?.setMatrixAt(i, o.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.035, 6, 6]} />
      <meshBasicMaterial color={new Color("#ffe08a").multiplyScalar(3)} toneMapped={false} />
    </instancedMesh>
  );
}

function ImpulseDecay() {
  useFrame((_, delta) => {
    journey.impulse = Math.max(0, journey.impulse - Math.min(delta, 0.1) * 1.4);
  });
  return null;
}

/**
 * Câmera: vista aérea do reino e, em cada capítulo, de frente para a fachada do monumento
 * (alinhada com a direção dele), com o monumento do lado oposto ao cartão.
 */
function buildKeys(): CameraKey[] {
  const up = new Vector3(0, 1, 0);
  return [
    { pos: [0, 24, 46], look: [0, 0, -2] },
    ...MONUMENTS.map((m, i): CameraKey => {
      const [fx, fz] = front(m);
      const f = new Vector3(fx, 0, fz);
      const base = new Vector3(m.x, groundAt(m.x, m.z), m.z);
      const height = m.kind === "citadel" ? 5.5 : m.kind === "runestones" ? 2.2 : 2.8;
      const dist = cameraDistance(m);
      const pos = base.clone().addScaledVector(f, dist).add(new Vector3(0, height + m.size * 0.8, 0));
      const forward = f.clone().negate();
      const right = forward.clone().cross(up).normalize();
      // Cartão à esquerda: o monumento vai para a direita (a câmera mira um pouco à esquerda dele).
      const side = REINO_ALIGN[i + 1] === "left" ? -1 : 1;
      const look = base.clone().add(new Vector3(0, height * 0.75, 0)).addScaledVector(right, side * (1.8 + m.size * 1.1));
      return { pos: [pos.x, pos.y, pos.z], look: [look.x, look.y, look.z] };
    }),
  ];
}

/** Reino: a carreira como uma jornada medieval, de monumento em monumento. */
export default function ReinoScene(props: WorldSceneProps) {
  const curve = useRoad();
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
      <fog attach="fog" args={["#1b2240", 30, 95]} />
      <Sky />
      <hemisphereLight args={["#5b6fa8", "#1a1408", 0.55]} />
      <directionalLight
        position={[-30, 40, -20]}
        intensity={1.1}
        color="#b9c8ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-far={120}
      />
      <CameraRig keys={keys} parallax={[0.7, 0.35]} follow={2.6} />
      <Terrain />
      <Road curve={curve} />
      <Forest curve={curve} />
      {MONUMENTS.map((m) => (
        <MonumentMesh key={m.kind} monument={m} />
      ))}
      <Knight curve={curve} />
      <Fireflies />
      {!props.device.low && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.2} intensity={0.9} radius={0.7} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette darkness={0.65} offset={0.25} />
          <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
        </EffectComposer>
      )}
    </WorldCanvas>
  );
}
