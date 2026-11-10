"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode, type BloomEffect } from "postprocessing";
import {
  CanvasTexture,
  Color,
  type InstancedMesh,
  type Mesh,
  type MeshStandardMaterial,
  Object3D,
  type PointLight,
  SRGBColorSpace,
  Vector3,
} from "three";
import { useContent } from "@/lib/preferences";
import CameraRig, { type CameraKey } from "../engine/CameraRig";
import { journey } from "../engine/journey";
import WorldCanvas from "../engine/WorldCanvas";
import type { WorldSceneProps } from "../engine/types";

// Cores da placa.
const MASK = "#0a3328";
const BG = "#03140f";
const COPPER = new Color("#b9853a");
const GOLD_HOT = new Color("#ffcf73").multiplyScalar(3.2);
const PULSE = new Color("#9ff6ff").multiplyScalar(5);
const LED_ON = new Color("#ffb347").multiplyScalar(4);
const LED_OFF = new Color("#2a1a08");
const TRAIL_COLOR = new Color("#5fdcff").multiplyScalar(2.2);

const BOARD = { w: 32, h: 22 };

/** Estações da jornada na placa (x, z), uma por capítulo a partir da origem. */
type Station = { x: number; z: number; size: number; label: string; sub: string };

const STATIONS: Station[] = [
  { x: -10, z: 6, size: 1.3, label: "ETEC", sub: "2014" },
  { x: -4.5, z: 4, size: 1.6, label: "NESTLÉ", sub: "2016" },
  { x: -7, z: -3.5, size: 2.4, label: "SINQIA", sub: "2018" },
  { x: 1, z: -5, size: 2.8, label: "BTG", sub: "2023" },
  { x: 7.5, z: -1, size: 2.6, label: "ITAÚ", sub: "2026" },
  { x: 4, z: 6, size: 0, label: "", sub: "" },
  { x: 14.6, z: 6, size: 0, label: "", sub: "" },
];
const CHIPS = STATIONS.slice(0, 5);
const STACK = STATIONS[5];
const EDGE = STATIONS[6];

/** Trilha principal: cada ligação entre estações vira dois trechos em L. */
function buildRoute() {
  const pieces: { a: Vector3; b: Vector3; link: number }[] = [];
  for (let i = 0; i < STATIONS.length - 1; i++) {
    const a = new Vector3(STATIONS[i].x, 0.02, STATIONS[i].z);
    const b = new Vector3(STATIONS[i + 1].x, 0.02, STATIONS[i + 1].z);
    const corner = new Vector3(b.x, 0.02, a.z);
    pieces.push({ a, b: corner, link: i }, { a: corner, b, link: i });
  }
  return pieces;
}

/** Ponto da trilha para um progresso `s` em estações (0 = origem, 6 = conector). */
function routePoint(pieces: ReturnType<typeof buildRoute>, s: number, out: Vector3) {
  const link = Math.min(STATIONS.length - 2, Math.max(0, Math.floor(s)));
  const f = Math.min(1, Math.max(0, s - link));
  const [p1, p2] = [pieces[link * 2], pieces[link * 2 + 1]];
  const l1 = p1.a.distanceTo(p1.b);
  const l2 = p2.a.distanceTo(p2.b);
  const d = f * (l1 + l2);
  if (d <= l1) return out.copy(p1.a).lerp(p1.b, l1 ? d / l1 : 0);
  return out.copy(p2.a).lerp(p2.b, l2 ? (d - l1) / l2 : 0);
}

const toU = (x: number) => ((x + BOARD.w / 2) / BOARD.w) * 2048;
const toV = (z: number) => ((z + BOARD.h / 2) / BOARD.h) * 1408;

/** Textura da placa desenhada no canvas: máscara de solda, trilhas finas, vias e serigrafia. */
function makeBoardTexture() {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 1408;
  const g = c.getContext("2d")!;
  g.fillStyle = MASK;
  g.fillRect(0, 0, c.width, c.height);
  let seed = 3;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // Trilhas decorativas em L, com ilhas nas pontas.
  for (let i = 0; i < 260; i++) {
    const x = r() * c.width;
    const y = r() * c.height;
    const horizontal = r() < 0.5;
    const len = 60 + r() * 380;
    const turn = 30 + r() * 160;
    g.strokeStyle = r() < 0.15 ? "#1b5a45" : "#124a39";
    g.lineWidth = 3 + Math.floor(r() * 4);
    g.beginPath();
    g.moveTo(x, y);
    const x2 = horizontal ? x + len : x;
    const y2 = horizontal ? y : y + len;
    g.lineTo(x2, y2);
    g.lineTo(x2 + (horizontal ? turn : turn * 0.7), y2 + (horizontal ? turn * 0.7 : turn));
    g.stroke();
    g.fillStyle = "#1f6a52";
    g.beginPath();
    g.arc(x, y, 6, 0, Math.PI * 2);
    g.fill();
  }
  // Fileiras de vias.
  g.fillStyle = "#0e2a22";
  for (let i = 0; i < 70; i++) {
    const x = r() * c.width;
    const y = r() * c.height;
    for (let k = 0; k < 6; k++) {
      g.beginPath();
      g.arc(x + k * 22, y, 5, 0, Math.PI * 2);
      g.fill();
    }
  }
  // Serigrafia: contornos dos chips, designadores e a identificação da placa.
  g.strokeStyle = "rgba(225,236,230,.55)";
  g.fillStyle = "rgba(225,236,230,.7)";
  g.lineWidth = 3;
  g.setLineDash([10, 8]);
  g.font = "600 26px monospace";
  CHIPS.forEach((s, i) => {
    const half = (s.size / 2 + 0.55) * (2048 / BOARD.w);
    g.strokeRect(toU(s.x) - half, toV(s.z) - half, half * 2, half * 2);
    g.fillText(`U${i + 1}`, toU(s.x) - half, toV(s.z) - half - 12);
  });
  g.setLineDash([]);
  g.font = "600 34px monospace";
  g.fillText("BDA-PORTFOLIO  REV 09  ·  SÃO PAULO / BR", 60, 1350);
  g.font = "600 24px monospace";
  g.fillText("J1  I/O", toU(EDGE.x) - 140, toV(EDGE.z) - 120);
  g.fillText("C1–C7  SKILLS", toU(STACK.x) - 100, toV(STACK.z) + 150);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Tampa do chip com o nome em serigrafia. */
function makeLabel(label: string, sub: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#121417";
  g.fillRect(0, 0, 512, 512);
  g.fillStyle = "#d8d8d4";
  g.textAlign = "center";
  g.font = `700 ${label.length > 5 ? 84 : 104}px monospace`;
  g.fillText(label, 256, 268);
  g.font = "500 44px monospace";
  g.fillStyle = "#8a8f8c";
  g.fillText(sub, 256, 340);
  g.beginPath();
  g.arc(70, 70, 22, 0, Math.PI * 2);
  g.fillStyle = "#2a2d31";
  g.fill();
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

function Board() {
  const texture = useMemo(() => makeBoardTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
      <planeGeometry args={[BOARD.w, BOARD.h]} />
      <meshStandardMaterial map={texture} roughness={0.55} metalness={0.15} />
    </mesh>
  );
}

function Chip({ station, index }: { station: Station; index: number }) {
  const label = useMemo(() => makeLabel(station.label, station.sub), [station]);
  useEffect(() => () => label.dispose(), [label]);
  const led = useRef<MeshStandardMaterial>(null);
  const body = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const visited = journey.smooth >= index + 1 - 0.35;
    const here = Math.abs(journey.smooth - (index + 1)) < 0.5;
    if (led.current) {
      const blink = index === 4 && !journey.reduced ? 0.65 + Math.sin(clock.elapsedTime * 4) * 0.35 : 1;
      led.current.emissive.copy(visited ? LED_ON : LED_OFF).multiplyScalar(visited ? blink : 1);
    }
    if (body.current) {
      const lift = here && !journey.reduced ? 0.08 + Math.sin(clock.elapsedTime * 2) * 0.03 : 0;
      body.current.position.y += (0.2 + lift - body.current.position.y) * 0.1;
    }
  });

  const s = station.size;
  return (
    <group position={[station.x, 0, station.z]}>
      <mesh ref={body} position-y={0.2}>
        <boxGeometry args={[s, 0.32, s]} />
        <meshStandardMaterial attach="material-0" color="#16181b" roughness={0.5} />
        <meshStandardMaterial attach="material-1" color="#16181b" roughness={0.5} />
        <meshStandardMaterial attach="material-2" map={label} roughness={0.6} />
        <meshStandardMaterial attach="material-3" color="#16181b" roughness={0.5} />
        <meshStandardMaterial attach="material-4" color="#16181b" roughness={0.5} />
        <meshStandardMaterial attach="material-5" color="#16181b" roughness={0.5} />
      </mesh>
      <mesh position={[s / 2 + 0.35, 0.08, -s / 2]}>
        <boxGeometry args={[0.18, 0.12, 0.1]} />
        <meshStandardMaterial ref={led} color="#1a1208" emissive={LED_OFF} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Pinos dourados de todos os chips numa única malha instanciada. */
function Pins() {
  const { count, matrices } = useMemo(() => {
    const dummy = new Object3D();
    const list: number[][] = [];
    for (const s of CHIPS) {
      const n = Math.max(3, Math.floor(s.size / 0.28));
      for (let k = 0; k < n; k++) {
        const t = -s.size / 2 + (s.size / n) * (k + 0.5);
        for (const [dx, dz, rot] of [
          [t, -s.size / 2 - 0.14, 0],
          [t, s.size / 2 + 0.14, 0],
          [-s.size / 2 - 0.14, t, Math.PI / 2],
          [s.size / 2 + 0.14, t, Math.PI / 2],
        ]) {
          dummy.position.set(s.x + dx, 0.06, s.z + dz);
          dummy.rotation.set(0, rot, 0);
          dummy.updateMatrix();
          list.push([...dummy.matrix.elements]);
        }
      }
    }
    return { count: list.length, matrices: list };
  }, []);
  const ref = useRef<InstancedMesh>(null);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    matrices.forEach((m, i) => mesh.instanceMatrix.array.set(m, i * 16));
    mesh.instanceMatrix.needsUpdate = true;
  }, [matrices]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.09, 0.06, 0.3]} />
      <meshStandardMaterial color="#d6a64f" metalness={0.9} roughness={0.25} />
    </instancedMesh>
  );
}

/** Trilha principal de cobre: acende atrás do pulso. */
function Route({ pieces }: { pieces: ReturnType<typeof buildRoute> }) {
  const ref = useRef<InstancedMesh>(null);
  const tmp = useMemo(() => ({ o: new Object3D(), c: new Color() }), []);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    pieces.forEach((p, i) => {
      const len = p.a.distanceTo(p.b) + 0.16;
      tmp.o.position.copy(p.a).lerp(p.b, 0.5);
      tmp.o.rotation.set(0, Math.abs(p.a.x - p.b.x) > 0.001 ? 0 : Math.PI / 2, 0);
      tmp.o.scale.set(len, 1, 1);
      tmp.o.updateMatrix();
      mesh.setMatrixAt(i, tmp.o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [pieces, tmp]);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const s = journey.smooth - 1;
    pieces.forEach((p, i) => {
      const lit = Math.min(1, Math.max(0, (s - p.link) * 2 - (i % 2) * 0.5));
      tmp.c.copy(COPPER).lerp(GOLD_HOT, lit * (0.55 + journey.impulse * 0.45));
      mesh.setColorAt(i, tmp.c);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, pieces.length]}>
      <boxGeometry args={[1, 0.035, 0.16]} />
      <meshStandardMaterial metalness={0.85} roughness={0.3} toneMapped={false} />
    </instancedMesh>
  );
}

/** O pulso de sinal (o Bruno) com rastro, viajando pela trilha conforme o scroll. */
function Pulse({ pieces }: { pieces: ReturnType<typeof buildRoute> }) {
  const head = useRef<Mesh>(null);
  const trail = useRef<InstancedMesh>(null);
  const light = useRef<PointLight>(null);
  const tmp = useMemo(() => ({ v: new Vector3(), o: new Object3D() }), []);
  const TRAIL = 14;

  useFrame(({ clock }, delta) => {
    // O pico do clique decai aqui (os efeitos podem nem existir em aparelho modesto).
    journey.impulse = Math.max(0, journey.impulse - Math.min(delta, 0.1) * 1.2);
    const s = Math.max(0, journey.smooth - 1);
    routePoint(pieces, s, tmp.v);
    const bob = journey.reduced ? 0 : Math.sin(clock.elapsedTime * 5) * 0.03;
    head.current?.position.set(tmp.v.x, 0.22 + bob, tmp.v.z);
    head.current?.scale.setScalar(1 + journey.impulse * 0.8);
    light.current?.position.set(tmp.v.x, 1.2, tmp.v.z);
    if (light.current) light.current.intensity = 2.2 + journey.impulse * 8;
    for (let k = 0; k < TRAIL; k++) {
      routePoint(pieces, Math.max(0, s - (k + 1) * 0.035), tmp.v);
      tmp.o.position.set(tmp.v.x, 0.16, tmp.v.z);
      tmp.o.scale.setScalar(Math.max(0.05, 1 - k / TRAIL));
      tmp.o.updateMatrix();
      trail.current?.setMatrixAt(k, tmp.o.matrix);
    }
    if (trail.current) trail.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <mesh ref={head}>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshBasicMaterial color={PULSE} toneMapped={false} />
      </mesh>
      <instancedMesh ref={trail} args={[undefined, undefined, TRAIL]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color={TRAIL_COLOR} toneMapped={false} transparent opacity={0.7} />
      </instancedMesh>
      <pointLight ref={light} color="#9ff6ff" intensity={2.2} distance={5} />
    </>
  );
}

/** Capacitores da stack: a altura de cada um é a proficiência (C# 96%, arquitetura 90%…). */
function Capacitors() {
  const { skills } = useContent();
  const tops = useRef<(MeshStandardMaterial | null)[]>([]);
  useFrame(({ clock }) => {
    const here = Math.max(0, 1 - Math.abs(journey.smooth - 6) * 1.5);
    tops.current.forEach((m, i) => {
      if (!m) return;
      const flicker = journey.reduced ? 1 : 0.8 + Math.sin(clock.elapsedTime * 3 + i) * 0.2;
      m.emissiveIntensity = 0.3 + here * 3.2 * flicker;
    });
  });
  return (
    <group position={[STACK.x - 3, 0, STACK.z]}>
      {skills.map((s, i) => {
        const h = 0.4 + (s.value / 100) * 2.4;
        const color = s.tone === "signal" ? "#9ff6ff" : "#ffcf73";
        return (
          <group key={s.label} position={[i * 1, 0, (i % 2) * 0.6]}>
            <mesh position-y={h / 2}>
              <cylinderGeometry args={[0.3, 0.3, h, 28]} />
              <meshStandardMaterial color="#1d2b4d" roughness={0.35} metalness={0.3} />
            </mesh>
            <mesh position-y={h + 0.02}>
              <cylinderGeometry args={[0.3, 0.3, 0.04, 28]} />
              <meshStandardMaterial
                ref={(m) => {
                  tops.current[i] = m;
                }}
                color="#202020"
                emissive={color}
                emissiveIntensity={0.3}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Conector de borda (I/O): os dedos dourados por onde o sinal sai, ou seja, o contato. */
function EdgeConnector() {
  const ref = useRef<InstancedMesh>(null);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new Object3D();
    for (let i = 0; i < 14; i++) {
      o.position.set(EDGE.x + 0.7, 0.02, EDGE.z - 2.6 + i * 0.4);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <>
      <instancedMesh ref={ref} args={[undefined, undefined, 14]}>
        <boxGeometry args={[1.1, 0.03, 0.24]} />
        <meshStandardMaterial color="#e2b25c" metalness={1} roughness={0.2} />
      </instancedMesh>
      <mesh position={[EDGE.x - 0.4, 0.35, EDGE.z]}>
        <boxGeometry args={[1, 0.7, 3]} />
        <meshStandardMaterial color="#1b1d20" metalness={0.3} roughness={0.6} />
      </mesh>
    </>
  );
}

function Effects() {
  const bloom = useRef<BloomEffect>(null);
  useFrame(() => {
    if (bloom.current) bloom.current.intensity = 0.9 + journey.impulse * 1.4;
  });
  return (
    <EffectComposer multisampling={0}>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.2} intensity={0.9} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette darkness={0.6} offset={0.25} />
      <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}

/** Câmera: vista geral da placa, depois de chip em chip; o objeto fica à direita do texto. */
const KEYS: CameraKey[] = [
  { pos: [3, 17, 15], look: [0, 0, 0.5] },
  { pos: [-6.5, 4.2, 11], look: [-11.6, 0, 5.6] },
  { pos: [-1, 4.5, 8.5], look: [-6.3, 0, 3.6] },
  { pos: [-2.5, 6, 3], look: [-9.2, 0, -3.8] },
  { pos: [5.5, 6.5, 1.5], look: [-1.4, 0, -5.2] },
  { pos: [12, 6, 5], look: [5.2, 0, -1.2] },
  { pos: [6.5, 5.5, 13.5], look: [2.2, 1, 5.6] },
  { pos: [11, 4, 12], look: [12.6, 0, 5.6] },
];

/** Mundo "Placa de circuito": a carreira como um sinal atravessando uma placa-mãe. */
export default function PlacaScene(props: WorldSceneProps) {
  const pieces = useMemo(() => buildRoute(), []);

  // Clique no mundo: o sinal dá um pico (trilhas e bloom acendem).
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
    <WorldCanvas {...props} background={BG} fov={38}>
      <fog attach="fog" args={[BG, 16, 46]} />
      <hemisphereLight args={["#bfefff", "#021a12", 0.55]} />
      <directionalLight position={[-8, 14, 6]} intensity={1.6} color="#fff1dc" />
      <CameraRig keys={KEYS} parallax={[0.8, 0.45]} />
      <Board />
      <Route pieces={pieces} />
      <Pins />
      {CHIPS.map((s, i) => (
        <Chip key={s.label} station={s} index={i} />
      ))}
      <Capacitors />
      <EdgeConnector />
      <Pulse pieces={pieces} />
      {!props.device.low && <Effects />}
    </WorldCanvas>
  );
}
