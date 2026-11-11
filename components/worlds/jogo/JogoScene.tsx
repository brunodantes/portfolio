"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, DepthOfField, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import {
  BackSide,
  CanvasTexture,
  Color,
  DoubleSide,
  type Group,
  type InstancedMesh,
  type Mesh,
  Object3D,
  QuadraticBezierCurve3,
  SRGBColorSpace,
  Vector3,
} from "three";
import { useContent } from "@/lib/preferences";
import CameraRig, { type CameraKey } from "../engine/CameraRig";
import { journey } from "../engine/journey";
import WorldCanvas from "../engine/WorldCanvas";
import type { WorldSceneProps } from "../engine/types";

const SKY_TOP = new Color("#140c33");
const SKY_MID = new Color("#5b2a86");
const SKY_LOW = new Color("#ff8a5c");
const GRASS = "#5ee3a1";
const DIRT = "#4a3270";
const ROCK = "#2c1f4a";
const GOLD = new Color("#ffd23f");

type Island = { x: number; y: number; z: number; r: number; kind: "school" | "shop" | "tower" | "keep" | "spire" | "vault" | "portal"; label: string };

/** As fases do mapa, em ordem: cada ilha sobe um pouco (a carreira crescendo). */
const ISLANDS: Island[] = [
  { x: -15, y: 0, z: 6, r: 2.2, kind: "school", label: "ETEC" },
  { x: -8.5, y: 0.9, z: 1, r: 2.4, kind: "shop", label: "NESTLÉ" },
  { x: -2, y: 1.8, z: -4.5, r: 2.9, kind: "tower", label: "SINQIA" },
  { x: 5.5, y: 2.8, z: -2.5, r: 3.1, kind: "keep", label: "BTG" },
  { x: 11.5, y: 4, z: 3.5, r: 3, kind: "spire", label: "ITAÚ" },
  { x: 6, y: 3.4, z: 10, r: 2.6, kind: "vault", label: "STACK" },
  { x: 13, y: 4.8, z: 15, r: 2.4, kind: "portal", label: "CONTINUE?" },
];
const HOPS = 6;

/** Caminho entre duas ilhas: um arco por cima do vazio. */
function segment(i: number) {
  const a = ISLANDS[i];
  const b = ISLANDS[i + 1];
  // Sai da borda de uma ilha e chega na borda da outra (o centro é da construção).
  const dir = new Vector3(b.x - a.x, 0, b.z - a.z).normalize();
  const start = new Vector3(a.x, a.y + 0.35, a.z).addScaledVector(dir, a.r * 0.62);
  const end = new Vector3(b.x, b.y + 0.35, b.z).addScaledVector(dir, -b.r * 0.62);
  const mid = start.clone().lerp(end, 0.5);
  mid.y += 1.6;
  return new QuadraticBezierCurve3(start, mid, end);
}

/** Céu em degradê (esfera vista por dentro). */
function Sky() {
  const material = useMemo(
    () => ({
      uniforms: { top: { value: SKY_TOP }, mid: { value: SKY_MID }, low: { value: SKY_LOW } },
      vertexShader: `varying vec3 vPos; void main(){ vPos = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 low; varying vec3 vPos;
        void main(){ float h = vPos.y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.55, h)) : mix(mid, low, smoothstep(0.0, -0.35, h));
        gl_FragColor = vec4(c, 1.0); }`,
    }),
    [],
  );
  return (
    <mesh scale={150}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial args={[material]} side={BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
}

function Stars() {
  const positions = useMemo(() => {
    let s = 4;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const arr = new Float32Array(900 * 3);
    for (let i = 0; i < 900; i++) {
      const u = r() * Math.PI * 2;
      const v = Math.acos(r() * 0.9);
      arr[i * 3] = Math.sin(v) * Math.cos(u) * 120;
      arr[i * 3 + 1] = Math.cos(v) * 120;
      arr[i * 3 + 2] = Math.sin(v) * Math.sin(u) * 120;
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#fff6d8" size={0.6} sizeAttenuation transparent opacity={0.8} fog={false} />
    </points>
  );
}

function makeSign(text: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 192;
  const g = c.getContext("2d")!;
  g.fillStyle = "#8a5a3b";
  g.fillRect(0, 0, 512, 192);
  g.fillStyle = "#6e4429";
  for (let y = 0; y < 192; y += 48) g.fillRect(0, y, 512, 6);
  g.fillStyle = "#fff4dd";
  g.textAlign = "center";
  g.font = `900 ${text.length > 7 ? 64 : 84}px sans-serif`;
  g.fillText(text, 256, 124);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Bandeira da fase: sobe quando o personagem chega na ilha. */
function Flag({ y, visited }: { y: number; visited: { current: number } }) {
  const flag = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!flag.current) return;
    flag.current.scale.y += (Math.max(0.05, visited.current) - flag.current.scale.y) * 0.08;
    if (!journey.reduced) flag.current.rotation.y = Math.sin(clock.elapsedTime * 2) * 0.25;
  });
  return (
    <group ref={flag} position={[0, y, 0]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
        <meshStandardMaterial color="#e8e2ff" />
      </mesh>
      <mesh position={[0.28, 1.05, 0]}>
        <boxGeometry args={[0.5, 0.3, 0.03]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

/** Construção de cada ilha, feita de formas simples (low-poly). */
function Building({ kind, visited }: { kind: Island["kind"]; visited: { current: number } }) {
  const wall = "#f4e7d3";
  const roof = "#ff6b6b";
  switch (kind) {
    case "school":
      return (
        <group>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1.6, 1, 1.1]} />
            <meshStandardMaterial color={wall} flatShading />
          </mesh>
          <mesh position={[0, 1.35, 0]} rotation-y={Math.PI / 4} castShadow>
            <coneGeometry args={[1.25, 0.7, 4]} />
            <meshStandardMaterial color={roof} flatShading />
          </mesh>
          <Flag visited={visited} y={1.6} />
        </group>
      );
    case "shop":
      return (
        <group>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[1.8, 1.1, 1.3]} />
            <meshStandardMaterial color="#ffd8a8" flatShading />
          </mesh>
          <mesh position={[0.55, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 1, 8]} />
            <meshStandardMaterial color="#b07aa1" flatShading />
          </mesh>
          <Flag visited={visited} y={1.1} />
        </group>
      );
    case "tower":
      return (
        <group>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.7, 0.85, 2.4, 8]} />
            <meshStandardMaterial color={wall} flatShading />
          </mesh>
          <mesh position={[0, 2.8, 0]} castShadow>
            <coneGeometry args={[0.95, 0.9, 8]} />
            <meshStandardMaterial color="#7c5cff" flatShading />
          </mesh>
          <Flag visited={visited} y={3.2} />
        </group>
      );
    case "keep":
      return (
        <group>
          <mesh position={[0, 0.9, 0]} castShadow>
            <boxGeometry args={[2.2, 1.8, 2.2]} />
            <meshStandardMaterial color="#e9dcf7" flatShading />
          </mesh>
          {[-0.8, 0, 0.8].flatMap((x) =>
            [-0.8, 0.8].map((z) => (
              <mesh key={`${x}${z}`} position={[x, 1.95, z]} castShadow>
                <boxGeometry args={[0.4, 0.35, 0.4]} />
                <meshStandardMaterial color="#e9dcf7" flatShading />
              </mesh>
            )),
          )}
          <Flag visited={visited} y={2} />
        </group>
      );
    case "spire":
      return (
        <group>
          <mesh position={[0, 1.6, 0]} castShadow>
            <cylinderGeometry args={[0.45, 0.9, 3.2, 6]} />
            <meshStandardMaterial color={wall} flatShading />
          </mesh>
          <mesh position={[0, 3.6, 0]} castShadow>
            <octahedronGeometry args={[0.55, 0]} />
            <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.4} flatShading toneMapped={false} />
          </mesh>
          <Flag visited={visited} y={4.1} />
        </group>
      );
    default:
      return null;
  }
}

/** Ilha flutuante: topo de grama, terra e uma rocha afunilada embaixo. */
function IslandMesh({ island, index }: { island: Island; index: number }) {
  const sign = useMemo(() => makeSign(island.label), [island.label]);
  useEffect(() => () => sign.dispose(), [sign]);
  const group = useRef<Group>(null);
  const visited = useMemo(() => ({ current: 0 }), []);
  useFrame(({ clock }) => {
    const reached = journey.smooth >= index + 1 - 0.4 ? 1 : 0;
    visited.current = reached;
    if (group.current && !journey.reduced) group.current.position.y = island.y + Math.sin(clock.elapsedTime * 0.8 + index) * 0.12;
  });
  return (
    <group ref={group} position={[island.x, island.y, island.z]}>
      <mesh position-y={-0.15} receiveShadow castShadow>
        <cylinderGeometry args={[island.r, island.r * 0.92, 0.3, 9]} />
        <meshStandardMaterial color={GRASS} flatShading />
      </mesh>
      <mesh position-y={-0.55} castShadow>
        <cylinderGeometry args={[island.r * 0.92, island.r * 0.75, 0.5, 9]} />
        <meshStandardMaterial color={DIRT} flatShading />
      </mesh>
      <mesh position-y={-1.9} rotation-x={Math.PI} castShadow>
        <coneGeometry args={[island.r * 0.75, 2.2, 7]} />
        <meshStandardMaterial color={ROCK} flatShading />
      </mesh>
      <group position={[0, 0, 0]}>
        <Building kind={island.kind} visited={visited} />
      </group>
      {island.kind !== "portal" && (
        <group position={[island.r * 0.55, 0, island.r * 0.6]} rotation-y={0.5}>
          <mesh position-y={0.4} castShadow>
            <boxGeometry args={[0.08, 0.8, 0.08]} />
            <meshStandardMaterial color="#6e4429" />
          </mesh>
          <mesh position-y={0.85}>
            <planeGeometry args={[1.2, 0.45]} />
            <meshStandardMaterial map={sign} side={DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/** Pedras do caminho entre as ilhas (instanciadas). */
function Stones({ curves }: { curves: QuadraticBezierCurve3[] }) {
  const ref = useRef<InstancedMesh>(null);
  const points = useMemo(() => curves.flatMap((c) => Array.from({ length: HOPS - 1 }, (_, k) => c.getPoint((k + 1) / HOPS))), [curves]);
  useEffect(() => {
    const o = new Object3D();
    points.forEach((p, i) => {
      o.position.set(p.x, p.y - 0.4, p.z);
      o.rotation.y = i;
      o.updateMatrix();
      ref.current?.setMatrixAt(i, o.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [points]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, points.length]} castShadow receiveShadow>
      <cylinderGeometry args={[0.38, 0.3, 0.22, 7]} />
      <meshStandardMaterial color="#ffe8a3" flatShading />
    </instancedMesh>
  );
}

/** Moedas acima do caminho; somem quando o personagem passa. */
function Coins({ curves }: { curves: QuadraticBezierCurve3[] }) {
  const ref = useRef<InstancedMesh>(null);
  const coins = useMemo(
    () => curves.flatMap((c, seg) => [0.3, 0.5, 0.7].map((t) => ({ p: c.getPoint(t).add(new Vector3(0, 0.9, 0)), at: seg + t }))),
    [curves],
  );
  const o = useMemo(() => new Object3D(), []);
  useFrame(({ clock }) => {
    const s = journey.smooth - 1;
    coins.forEach((coin, i) => {
      const taken = Math.min(1, Math.max(0, (s - coin.at) * 6));
      o.position.copy(coin.p);
      o.position.y += taken * 0.8 + (journey.reduced ? 0 : Math.sin(clock.elapsedTime * 3 + i) * 0.06);
      o.rotation.set(Math.PI / 2, 0, journey.reduced ? 0 : clock.elapsedTime * 3 + i);
      o.scale.setScalar(Math.max(0.0001, 1 - taken));
      o.updateMatrix();
      ref.current?.setMatrixAt(i, o.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, coins.length]} frustumCulled={false}>
      <cylinderGeometry args={[0.22, 0.22, 0.06, 16]} />
      <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.9} metalness={0.6} roughness={0.3} toneMapped={false} />
    </instancedMesh>
  );
}

/** O personagem: um cubo com olhos que pula de pedra em pedra. */
function Hero({ curves, focus }: { curves: QuadraticBezierCurve3[]; focus: Vector3 }) {
  const root = useRef<Group>(null);
  const body = useRef<Mesh>(null);
  const tmp = useMemo(() => ({ p: new Vector3(), q: new Vector3() }), []);
  const jump = useRef(0);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.1);
    const s = Math.min(curves.length - 0.0001, Math.max(0, journey.smooth - 1));
    const seg = Math.floor(s);
    const f = s - seg;
    curves[seg].getPoint(f, tmp.p);
    curves[seg].getPoint(Math.min(1, f + 0.02), tmp.q);
    // Pulinhos: um por pedra; no clique, um pulo alto.
    const hop = journey.reduced ? 0 : Math.abs(Math.sin(f * Math.PI * HOPS)) * 0.45;
    if (journey.impulse > 0.95 && jump.current <= 0) jump.current = 1;
    jump.current = Math.max(0, jump.current - dt * 1.6);
    const big = Math.sin(jump.current * Math.PI) * 1.8;
    const idle = journey.reduced ? 0 : Math.abs(Math.sin(clock.elapsedTime * 2.4)) * 0.08;
    const g = root.current;
    if (!g) return;
    g.position.set(tmp.p.x, tmp.p.y + 0.35 + hop + big + idle, tmp.p.z);
    if (tmp.q.distanceToSquared(tmp.p) > 1e-6) g.lookAt(tmp.q.x, g.position.y, tmp.q.z);
    if (body.current) {
      // Estica no ar, achata ao tocar a pedra.
      const air = Math.min(1, (hop + big) * 2);
      body.current.scale.set(1 - air * 0.12 + (1 - air) * 0.06, 1 + air * 0.2 - (1 - air) * 0.08, 1 - air * 0.12 + (1 - air) * 0.06);
      body.current.rotation.z = jump.current > 0 ? (1 - jump.current) * Math.PI * 2 : 0;
    }
    focus.copy(g.position);
  });

  return (
    <group ref={root}>
      <mesh ref={body} castShadow>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial color="#38e1ff" flatShading />
        <mesh position={[-0.12, 0.08, 0.28]}>
          <boxGeometry args={[0.09, 0.14, 0.02]} />
          <meshBasicMaterial color="#140c33" />
        </mesh>
        <mesh position={[0.12, 0.08, 0.28]}>
          <boxGeometry args={[0.09, 0.14, 0.02]} />
          <meshBasicMaterial color="#140c33" />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
          <meshStandardMaterial color="#e8e2ff" />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color={GOLD.clone().multiplyScalar(2.5)} toneMapped={false} />
        </mesh>
      </mesh>
    </group>
  );
}

/** Ilha do inventário: um cristal por skill, do tamanho da proficiência, girando em volta. */
function Inventory() {
  const { skills } = useContent();
  const island = ISLANDS[5];
  const ring = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ring.current && !journey.reduced) ring.current.rotation.y += Math.min(delta, 0.1) * 0.5;
  });
  return (
    <group position={[island.x, island.y, island.z]}>
      <mesh position-y={0.4} castShadow>
        <cylinderGeometry args={[0.6, 0.8, 0.8, 8]} />
        <meshStandardMaterial color="#e9dcf7" flatShading />
      </mesh>
      <group ref={ring} position-y={1.6}>
        {skills.map((s, i) => {
          const a = (i / skills.length) * Math.PI * 2;
          const size = 0.18 + (s.value / 100) * 0.32;
          const color = new Color(s.tone === "signal" ? "#38e1ff" : "#7cff9e");
          return (
            <mesh key={s.label} position={[Math.cos(a) * 1.6, Math.sin(i * 1.7) * 0.25, Math.sin(a) * 1.6]} castShadow>
              <octahedronGeometry args={[size, 0]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} flatShading toneMapped={false} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/** O portal do contato: um anel girando ("Continue?"). */
function Portal() {
  const island = ISLANDS[6];
  const ring = useRef<Mesh>(null);
  const core = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (journey.reduced) return;
    if (ring.current) ring.current.rotation.z = clock.elapsedTime * 0.8;
    if (core.current) core.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 3) * 0.05);
  });
  return (
    <group position={[island.x, island.y + 1.6, island.z]} rotation-y={-0.7}>
      <mesh ref={ring} castShadow>
        <torusGeometry args={[1.3, 0.16, 12, 6]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1.1} flatShading toneMapped={false} />
      </mesh>
      <mesh ref={core}>
        <circleGeometry args={[1.15, 32]} />
        <meshBasicMaterial color={new Color("#b388ff").multiplyScalar(1.8)} transparent opacity={0.75} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Nuvens low-poly passando entre as ilhas. */
function Clouds() {
  const group = useRef<Group>(null);
  const clouds = useMemo(() => {
    let s = 17;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: 16 }, () => ({ x: (r() - 0.5) * 70, y: -9 + r() * 5, z: (r() - 0.5) * 50, s: 0.8 + r() * 1.6 }));
  }, []);
  useFrame((_, delta) => {
    if (group.current && !journey.reduced) group.current.position.x = ((group.current.position.x + Math.min(delta, 0.1) * 0.4 + 30) % 60) - 30;
  });
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} scale={[c.s * 1.8, c.s * 0.6, c.s]}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#ffd6e8" flatShading transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Effects({ focus }: { focus: Vector3 }) {
  return (
    <EffectComposer multisampling={0}>
      {/* Desfoque de profundidade no personagem: o mundo vira uma maquete. */}
      <DepthOfField target={focus} focalLength={0.12} bokehScale={1.8} height={480} />
      <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.25} intensity={0.75} radius={0.6} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette darkness={0.5} offset={0.3} />
    </EffectComposer>
  );
}

function ImpulseDecay() {
  useFrame((_, delta) => {
    journey.impulse = Math.max(0, journey.impulse - Math.min(delta, 0.1) * 1.5);
  });
  return null;
}

/** Câmera em terceira pessoa: vista do arquipélago, depois atrás e acima de cada ilha. */
const KEYS: CameraKey[] = [
  { pos: [-4, 16, 34], look: [0, 1, 4] },
  ...ISLANDS.map(
    (i): CameraKey => ({ pos: [i.x + 6.5, i.y + 5.5, i.z + 9.5], look: [i.x - 2.2, i.y + 0.9, i.z - 0.5] }),
  ),
];

/** Mundo "Mundo do jogo": a carreira como um mapa de fases em ilhas flutuantes. */
export default function JogoScene(props: WorldSceneProps) {
  const curves = useMemo(() => ISLANDS.slice(0, -1).map((_, i) => segment(i)), []);
  const focus = useMemo(() => new Vector3(), []);

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
    <WorldCanvas {...props} background="#140c33" fov={40} shadows>
      <ImpulseDecay />
      <fog attach="fog" args={["#4a2477", 30, 90]} />
      <Sky />
      <Stars />
      <hemisphereLight args={["#ffb3d1", "#2a1a4a", 0.9]} />
      <directionalLight
        position={[-14, 18, 10]}
        intensity={2.4}
        color="#ffd2a0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <CameraRig keys={KEYS} parallax={[0.9, 0.5]} />
      <Clouds />
      {ISLANDS.map((island, i) => (
        <IslandMesh key={island.label} island={island} index={i} />
      ))}
      <Stones curves={curves} />
      <Coins curves={curves} />
      <Inventory />
      <Portal />
      <Hero curves={curves} focus={focus} />
      {!props.device.low && <Effects focus={focus} />}
    </WorldCanvas>
  );
}
