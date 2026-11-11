"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode, type BloomEffect } from "postprocessing";
import {
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  type Group,
  type InstancedMesh,
  Object3D,
  RepeatWrapping,
  SRGBColorSpace,
  type SpotLight,
  Vector2,
  Vector3,
} from "three";
import { useContent } from "@/lib/preferences";
import CameraRig, { type CameraKey } from "../engine/CameraRig";
import { journey } from "../engine/journey";
import WorldCanvas from "../engine/WorldCanvas";
import type { WorldSceneProps } from "../engine/types";

const BG = "#03060b";
const LED_BLUE = new Color("#7cc7ff").multiplyScalar(2.6);
const LED_GREEN = new Color("#4dff9a").multiplyScalar(2.4);
const LED_AMBER = new Color("#ffb347").multiplyScalar(2.6);
const LED_DIM = new Color("#0b1622");
const WHITE_HOT = new Color("#e8f4ff").multiplyScalar(3.2);

const AISLE_X = 3.2;
const RACK = { w: 1.1, h: 2.4, d: 1.2, gap: 1.3 };
const RACK_Z = Array.from({ length: 44 }, (_, i) => 8 - i * RACK.gap);

/** Rack de cada capítulo da carreira: lado do corredor (-1 esquerda, 1 direita) e posição. */
const STATIONS = [
  { side: -1, z: -4, label: "ETEC", sub: "TÉCNICO · 2014" },
  { side: 1, z: -12, label: "NESTLÉ", sub: "2016 — 2017" },
  { side: -1, z: -21, label: "SINQIA", sub: "2018 — 2023" },
  { side: 1, z: -30.5, label: "BTG PACTUAL", sub: "2023 — 2026" },
  { side: -1, z: -40, label: "ITAÚ UNIBANCO", sub: "2026 → ONLINE" },
];
const PATCH_Z = -50;
const DESK_Z = -55.5;

function useDisposable<T extends { dispose: () => void }>(factory: () => T) {
  const value = useMemo(factory, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => value.dispose(), [value]);
  return value;
}

function Racks() {
  const bodies = useRef<InstancedMesh>(null);
  const leds = useRef<InstancedMesh>(null);
  const layout = useMemo(() => {
    const racks: { x: number; z: number; side: number }[] = [];
    for (const side of [-1, 1]) for (const z of RACK_Z) racks.push({ x: side * AISLE_X, z, side });
    const ledPos: { x: number; y: number; z: number; kind: number }[] = [];
    let seed = 5;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (const rack of racks) {
      const face = rack.x - rack.side * (RACK.w / 2 + 0.01);
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 3; col++) {
          const roll = r();
          ledPos.push({ x: face, y: 0.35 + row * 0.27, z: rack.z - 0.32 + col * 0.32, kind: roll < 0.08 ? 2 : roll < 0.35 ? 1 : 0 });
        }
      }
    }
    return { racks, ledPos };
  }, []);

  useEffect(() => {
    const o = new Object3D();
    layout.racks.forEach((rack, i) => {
      o.position.set(rack.x, RACK.h / 2, rack.z);
      o.updateMatrix();
      bodies.current?.setMatrixAt(i, o.matrix);
    });
    layout.ledPos.forEach((led, i) => {
      o.position.set(led.x, led.y, led.z);
      o.updateMatrix();
      leds.current?.setMatrixAt(i, o.matrix);
    });
    if (bodies.current) bodies.current.instanceMatrix.needsUpdate = true;
    if (leds.current) leds.current.instanceMatrix.needsUpdate = true;
  }, [layout]);

  const seed = useRef(1);
  useFrame(({ clock }) => {
    const mesh = leds.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    const flash = journey.impulse;
    layout.ledPos.forEach((led, i) => {
      // Piscar pseudoaleatório e estável por LED; o "ping" do clique acende todos.
      seed.current = (i * 9301 + Math.floor(t * (led.kind === 0 ? 3 : 1.3)) * 49297) % 233280;
      const on = journey.reduced || seed.current / 233280 > 0.35;
      const base = led.kind === 2 ? LED_AMBER : led.kind === 1 ? LED_GREEN : LED_BLUE;
      tmpColor.copy(on ? base : LED_DIM).lerp(WHITE_HOT, flash);
      mesh.setColorAt(i, tmpColor);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={bodies} args={[undefined, undefined, layout.racks.length]}>
        <boxGeometry args={[RACK.w, RACK.h, RACK.d]} />
        <meshStandardMaterial color="#14181e" metalness={0.75} roughness={0.42} />
      </instancedMesh>
      <instancedMesh ref={leds} args={[undefined, undefined, layout.ledPos.length]} frustumCulled={false}>
        <boxGeometry args={[0.012, 0.035, 0.07]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </>
  );
}
const tmpColor = new Color();

function makeBezel(label: string, sub: string) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#0c1118";
  g.fillRect(0, 0, 1024, 256);
  g.fillStyle = "#1c2633";
  for (let x = 640; x < 1000; x += 18) for (let y = 30; y < 230; y += 18) g.fillRect(x, y, 10, 10);
  g.fillStyle = "#e8f4ff";
  g.font = "700 74px sans-serif";
  g.fillText(label, 40, 120);
  g.fillStyle = "#7cc7ff";
  g.font = "500 40px monospace";
  g.fillText(sub, 40, 190);
  g.fillStyle = "#4dff9a";
  g.beginPath();
  g.arc(600, 70, 12, 0, Math.PI * 2);
  g.fill();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** O servidor de cada empresa: desliza para fora do rack quando o capítulo chega. */
function Blade({ station, index }: { station: (typeof STATIONS)[number]; index: number }) {
  const group = useRef<Group>(null);
  const bezel = useDisposable(() => makeBezel(station.label, station.sub));
  const x = station.side * AISLE_X;
  const face = x - station.side * (RACK.w / 2);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const here = Math.max(0, 1 - Math.abs(journey.smooth - (index + 1)) * 1.4);
    const target = face - station.side * (here * 0.95);
    g.position.x = journey.reduced ? target : g.position.x + (target - g.position.x) * (1 - Math.exp(-6 * Math.min(delta, 0.1)));
  });

  return (
    <group ref={group} position={[face, 1.35, station.z]}>
      <mesh position={[station.side * 0.5, 0, 0]}>
        <boxGeometry args={[1, 0.24, 1.1]} />
        <meshStandardMaterial color="#1b2129" metalness={0.8} roughness={0.35} />
      </mesh>
      {/* Painel frontal com o nome, virado para o corredor. */}
      <mesh position={[-station.side * 0.005, 0, 0]} rotation-y={station.side > 0 ? -Math.PI / 2 : Math.PI / 2}>
        <planeGeometry args={[1.1, 0.24]} />
        <meshBasicMaterial map={bezel} toneMapped={false} />
      </mesh>
      <mesh position={[-station.side * 0.01, -0.135, 0]}>
        <boxGeometry args={[0.01, 0.018, 1.1]} />
        <meshBasicMaterial color={index === 4 ? LED_GREEN : LED_BLUE} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Ceiling() {
  const lights = useRef<InstancedMesh>(null);
  useEffect(() => {
    const o = new Object3D();
    let i = 0;
    for (const x of [-1.1, 1.1]) {
      for (let k = 0; k < 16; k++) {
        o.position.set(x, 3.35, 8 - k * 4);
        o.updateMatrix();
        lights.current?.setMatrixAt(i++, o.matrix);
      }
    }
    if (lights.current) lights.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <>
      <instancedMesh ref={lights} args={[undefined, undefined, 32]}>
        <boxGeometry args={[0.12, 0.04, 2.6]} />
        <meshBasicMaterial color={new Color("#d8ecff").multiplyScalar(2.2)} toneMapped={false} />
      </instancedMesh>
      {[-AISLE_X + 0.9, AISLE_X - 0.9].map((x) => (
        <mesh key={x} position={[x, 3.05, -24]}>
          <boxGeometry args={[0.7, 0.08, 66]} />
          <meshStandardMaterial color="#1a1f26" metalness={0.8} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 3.6, -24]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[12, 70]} />
        <meshStandardMaterial color="#05080d" />
      </mesh>
    </>
  );
}

function makeTiles() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#3a4250";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#20252d";
  g.fillRect(0, 0, 256, 6);
  g.fillRect(0, 0, 6, 256);
  g.fillStyle = "#2b313a";
  for (let x = 30; x < 240; x += 24) for (let y = 30; y < 240; y += 24) g.fillRect(x, y, 6, 6);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(10, 66);
  t.anisotropy = 8;
  return t;
}

/** Piso elevado de data center, refletindo os LEDs (reflexo só em aparelho bom). */
function Floor({ reflect }: { reflect: boolean }) {
  const tiles = useDisposable(makeTiles);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -24]}>
      <planeGeometry args={[12, 80]} />
      {reflect ? (
        <MeshReflectorMaterial
          map={tiles}
          blur={[300, 80]}
          resolution={512}
          mixBlur={1}
          mixStrength={2.2}
          roughness={0.75}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#4b5563"
          metalness={0.5}
          mirror={0.6}
        />
      ) : (
        <meshStandardMaterial map={tiles} color="#5b6472" metalness={0.4} roughness={0.6} />
      )}
    </mesh>
  );
}

/** Patch panel da stack: um cabo por skill, com o comprimento da proficiência. */
function PatchPanel() {
  const { skills } = useContent();
  const cables = useMemo(
    () =>
      skills.map((s, i) => {
        const x = -2.1 + i * 0.7;
        const sag = 0.4 + (s.value / 100) * 1.4;
        const end = new Vector3(x + (i % 2 ? 0.9 : -0.9), 0.05, PATCH_Z + 1.6 + (i % 3) * 0.3);
        const curve = new CatmullRomCurve3([
          new Vector3(x, 2.2, PATCH_Z + 0.12),
          new Vector3(x, 2.2 - sag * 0.6, PATCH_Z + 0.5),
          new Vector3((x + end.x) / 2, 0.3, PATCH_Z + 1.2),
          end,
        ]);
        return { curve, color: new Color(s.tone === "signal" ? "#7cc7ff" : "#4dff9a"), key: s.label };
      }),
    [skills],
  );
  const glow = useRef<(Group | null)[]>([]);
  useFrame(({ clock }) => {
    const here = Math.max(0, 1 - Math.abs(journey.smooth - 6) * 1.2);
    glow.current.forEach((g, i) => {
      if (!g) return;
      const pulse = journey.reduced ? 1 : 0.7 + Math.sin(clock.elapsedTime * 3 - i) * 0.3;
      g.scale.setScalar(0.6 + here * 0.4 * pulse);
    });
  });
  return (
    <group>
      <mesh position={[0, 1.6, PATCH_Z]}>
        <boxGeometry args={[5.6, 2.4, 0.2]} />
        <meshStandardMaterial color="#10141a" metalness={0.7} roughness={0.4} />
      </mesh>
      {Array.from({ length: 48 }, (_, i) => (
        <mesh key={i} position={[-2.6 + (i % 16) * 0.35, 1.2 + Math.floor(i / 16) * 0.5, PATCH_Z + 0.11]}>
          <boxGeometry args={[0.18, 0.12, 0.02]} />
          <meshStandardMaterial color="#05070a" />
        </mesh>
      ))}
      {cables.map((c, i) => (
        <group key={c.key}>
          <mesh>
            <tubeGeometry args={[c.curve, 48, 0.035, 8, false]} />
            <meshStandardMaterial color={c.color} emissive={c.color} emissiveIntensity={0.9} roughness={0.4} />
          </mesh>
          <group
            ref={(el) => {
              glow.current[i] = el;
            }}
            position={c.curve.getPoint(0)}
          >
            <mesh>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshBasicMaterial color={c.color.clone().multiplyScalar(3)} toneMapped={false} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

/** Terminal do contato: o cursor pisca no fim do corredor. */
function Terminal() {
  const { player } = useContent();
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 640;
    return c;
  }, []);
  const texture = useDisposable(() => {
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    return t;
  });
  const last = useRef(-1);
  useFrame(({ clock }) => {
    const blink = journey.reduced ? 1 : Math.floor(clock.elapsedTime * 2) % 2;
    if (blink === last.current) return;
    last.current = blink;
    const g = canvas.getContext("2d")!;
    g.fillStyle = "#03080a";
    g.fillRect(0, 0, 1024, 640);
    g.font = "500 40px monospace";
    const lines = [
      ["#4dff9a", "bruno@sp:~$ ping bruno.almeida"],
      ["#7cc7ff", "PONG  uptime 99.99%  latency 1ms"],
      ["#4dff9a", `bruno@sp:~$ open ${player.linkedin}`],
      ["#7cc7ff", "connection established"],
      ["#4dff9a", "bruno@sp:~$ "],
    ];
    lines.forEach(([color, text], i) => {
      g.fillStyle = color;
      g.fillText(text, 48, 96 + i * 92);
    });
    if (blink) {
      g.fillStyle = "#4dff9a";
      g.fillRect(48 + g.measureText("bruno@sp:~$ ").width, 96 + 4 * 92 - 34, 24, 42);
    }
    texture.needsUpdate = true;
  });
  return (
    <group position={[0, 0, DESK_Z]}>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[2.8, 0.08, 1]} />
        <meshStandardMaterial color="#1a2028" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.55, -0.3]} rotation-x={-0.12}>
        <boxGeometry args={[2.2, 1.4, 0.06]} />
        <meshStandardMaterial color="#0b0e12" />
      </mesh>
      <mesh position={[0, 1.55, -0.265]} rotation-x={-0.12}>
        <planeGeometry args={[2.05, 1.28]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Lanterna presa à câmera, apontando para onde o mouse está. */
function Flashlight({ enabled }: { enabled: boolean }) {
  const light = useRef<SpotLight>(null);
  const target = useMemo(() => new Object3D(), []);
  useFrame(({ camera, pointer, raycaster }) => {
    const l = light.current;
    if (!l) return;
    raycaster.setFromCamera(pointer, camera);
    l.position.copy(camera.position);
    target.position.copy(camera.position).addScaledVector(raycaster.ray.direction, 6);
    target.updateMatrixWorld();
    l.intensity = enabled ? 26 + journey.impulse * 30 : 0;
  });
  return (
    <>
      <primitive object={target} />
      <spotLight ref={light} target={target} angle={0.38} penumbra={0.7} distance={18} color="#cfe6ff" intensity={26} />
    </>
  );
}

function Effects() {
  const bloom = useRef<BloomEffect>(null);
  const offset = useMemo(() => new Vector2(0.0006, 0.0004), []);
  useFrame(() => {
    if (bloom.current) bloom.current.intensity = 0.9 + journey.impulse * 1.2;
  });
  return (
    <EffectComposer multisampling={0}>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.9} radius={0.7} />
      <ChromaticAberration offset={offset} radialModulation={false} modulationOffset={0} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette darkness={0.7} offset={0.22} />
      <Noise opacity={0.045} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}

function ImpulseDecay() {
  useFrame((_, delta) => {
    journey.impulse = Math.max(0, journey.impulse - Math.min(delta, 0.1) * 1.5);
  });
  return null;
}

/** Câmera andando pelo corredor; em cada capítulo vira para o rack da empresa (o texto fica do outro lado). */
const station = (side: number, z: number): CameraKey => ({
  pos: [-side * 1.3, 1.75, z + 3.6],
  look: [side * 1.2, 1.35, z - 1],
});
const KEYS: CameraKey[] = [
  { pos: [0, 1.9, 13], look: [0, 1.5, -20] },
  ...STATIONS.map((s) => station(s.side, s.z)),
  { pos: [1.4, 1.9, PATCH_Z + 6], look: [0.6, 1.2, PATCH_Z] },
  { pos: [-1.2, 1.8, DESK_Z + 3.4], look: [-0.2, 1.45, DESK_Z] },
];

/** Mundo "Sala de controle": um corredor de data center onde cada rack guarda um capítulo. */
export default function DatacenterScene(props: WorldSceneProps) {
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
    <WorldCanvas {...props} background={BG} fov={55}>
      <ImpulseDecay />
      <fog attach="fog" args={[BG, 6, 34]} />
      <ambientLight intensity={0.18} />
      <hemisphereLight args={["#9cc9ff", "#05080d", 0.35]} />
      <CameraRig keys={KEYS} parallax={[0.3, 0.18]} follow={2.6} />
      <Flashlight enabled={!props.reduced} />
      <Floor reflect={!props.device.low} />
      <Ceiling />
      <Racks />
      {STATIONS.map((s, i) => (
        <Blade key={s.label} station={s} index={i} />
      ))}
      <PatchPanel />
      <Terminal />
      {!props.device.low && <Effects />}
    </WorldCanvas>
  );
}
