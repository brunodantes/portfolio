"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import {
  BackSide,
  CanvasTexture,
  Color,
  DoubleSide,
  type Group,
  type InstancedMesh,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
  Object3D,
  type PointLight,
  type ShaderMaterial,
  QuadraticBezierCurve3,
  SRGBColorSpace,
  Vector3,
} from "three";
import { useContent } from "@/lib/preferences";
import CameraRig, { type CameraKey } from "../engine/CameraRig";
import { journey } from "../engine/journey";
import WorldCanvas from "../engine/WorldCanvas";
import { ISLANDS, type Island, type Kind } from "./layout";
import type { WorldSceneProps } from "../engine/types";

const BG = "#070b14";
const ACCENT = new Color("#3be87f");
const SIGNAL = new Color("#38e1ff");
const MOSS = "#3f5a45";
const STONE = "#3b4452";
const ROCK = "#1b2129";
const FOG = "#0d1828";

function route(i: number) {
  const a = ISLANDS[i];
  const b = ISLANDS[i + 1];
  const dir = new Vector3(b.x - a.x, 0, b.z - a.z).normalize();
  const start = new Vector3(a.x, a.y + 0.4, a.z).addScaledVector(dir, a.r * 0.6);
  const end = new Vector3(b.x, b.y + 0.4, b.z).addScaledVector(dir, -b.r * 0.6);
  const mid = start.clone().lerp(end, 0.5);
  mid.y += 1.1;
  return new QuadraticBezierCurve3(start, mid, end);
}

/** Quanto a ilha já foi revelada (névoa de guerra). */
const revealOf = (index: number) => Math.min(1, Math.max(0, (journey.smooth - index + 0.2) * 1.4));

function Sky() {
  const args = useMemo(
    () => ({
      uniforms: { top: { value: new Color("#03060b") }, mid: { value: new Color("#0f1d30") }, low: { value: new Color("#1d4652") } },
      vertexShader: `varying vec3 vPos; void main(){ vPos = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 low; varying vec3 vPos;
        void main(){ float h = vPos.y; vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.5, h)) : mix(mid, low, smoothstep(0.0, -0.3, h));
        gl_FragColor = vec4(c, 1.0); }`,
    }),
    [],
  );
  const stars = useMemo(() => {
    let s = 8;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const arr = new Float32Array(1400 * 3);
    for (let i = 0; i < 1400; i++) {
      const u = r() * Math.PI * 2;
      const v = Math.acos(r() * 0.95);
      arr[i * 3] = Math.sin(v) * Math.cos(u) * 120;
      arr[i * 3 + 1] = Math.cos(v) * 120;
      arr[i * 3 + 2] = Math.sin(v) * Math.sin(u) * 120;
    }
    return arr;
  }, []);
  return (
    <>
      <mesh scale={150}>
        <sphereGeometry args={[1, 32, 16]} />
        <shaderMaterial args={[args]} side={BackSide} depthWrite={false} fog={false} />
      </mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stars, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#cfe0ff" size={0.45} sizeAttenuation transparent opacity={0.75} fog={false} />
      </points>
    </>
  );
}

function makeLabel(code: string, label: string) {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 160;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(7,11,20,0.78)";
  g.fillRect(0, 0, 768, 160);
  g.strokeStyle = "#3be87f";
  g.lineWidth = 4;
  g.strokeRect(2, 2, 764, 156);
  g.fillStyle = "#3be87f";
  g.fillRect(0, 0, 14, 160);
  g.font = "600 44px monospace";
  g.fillStyle = "#8fe9b4";
  g.fillText(code, 44, 64);
  g.font = "700 62px sans-serif";
  g.fillStyle = "#e9f2ff";
  g.fillText(label, 44, 132);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Etiqueta holográfica sobre a ilha, sempre virada para a câmera. */
function Label({ island, index }: { island: Island; index: number }) {
  const texture = useMemo(() => makeLabel(island.code, island.label), [island]);
  useEffect(() => () => texture.dispose(), [texture]);
  const group = useRef<Group>(null);
  const material = useRef<MeshBasicMaterial>(null);
  useFrame(({ camera }) => {
    group.current?.quaternion.copy(camera.quaternion);
    if (material.current) material.current.opacity = 0.25 + revealOf(index) * 0.75;
  });
  return (
    <group ref={group} position={[0, island.kind === "glasstower" ? 5.4 : 3.6, 0]}>
      <mesh>
        <planeGeometry args={[2.9, 0.6]} />
        <meshBasicMaterial ref={material} map={texture} transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Glow({ color, intensity = 2, children }: { color: Color; intensity?: number; children: ReactNode }) {
  return (
    <mesh>
      {children}
      <meshBasicMaterial color={color.clone().multiplyScalar(intensity)} toneMapped={false} />
    </mesh>
  );
}

/** Construções sóbrias: cada uma representa a fase da carreira. */
function Structure({ kind }: { kind: Kind }) {
  const { skills } = useContent();
  const metal = { color: "#5b6676", metalness: 0.6, roughness: 0.45, flatShading: true } as const;
  const concrete = { color: "#8892a0", roughness: 0.8, flatShading: true } as const;
  const beacon = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (beacon.current && !journey.reduced) beacon.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 3) * 0.25);
  });

  switch (kind) {
    case "bench":
      // Bancada de eletrônica: a origem técnica.
      return (
        <group>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[1.8, 0.1, 0.9]} />
            <meshStandardMaterial {...metal} />
          </mesh>
          {[-0.8, 0.8].map((x) => (
            <mesh key={x} position={[x, 0.2, 0]} castShadow>
              <boxGeometry args={[0.08, 0.4, 0.8]} />
              <meshStandardMaterial {...metal} />
            </mesh>
          ))}
          <mesh position={[-0.35, 0.75, -0.15]} castShadow>
            <boxGeometry args={[0.7, 0.5, 0.35]} />
            <meshStandardMaterial color="#20262f" />
          </mesh>
          <mesh position={[-0.35, 0.78, 0.03]}>
            <planeGeometry args={[0.56, 0.36]} />
            <meshBasicMaterial color={ACCENT.clone().multiplyScalar(1.6)} toneMapped={false} />
          </mesh>
          <mesh position={[0.45, 0.52, 0.1]} castShadow>
            <boxGeometry args={[0.45, 0.04, 0.45]} />
            <meshStandardMaterial color="#0f3b2c" />
          </mesh>
        </group>
      );
    case "warehouse":
      return (
        <group>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[2.2, 1.1, 1.4]} />
            <meshStandardMaterial {...concrete} />
          </mesh>
          <mesh position={[0, 1.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.75, 0.75, 2.25, 3]} />
            <meshStandardMaterial {...metal} />
          </mesh>
          <mesh position={[0, 0.4, 0.71]}>
            <planeGeometry args={[0.8, 0.7]} />
            <meshStandardMaterial color="#2a313b" />
          </mesh>
        </group>
      );
    case "datatower":
      return (
        <group>
          {[0, 1, 2].map((t) => (
            <group key={t} position={[0, 0.55 + t * 1.05, 0]}>
              <mesh castShadow>
                <boxGeometry args={[1.6 - t * 0.3, 1, 1.6 - t * 0.3]} />
                <meshStandardMaterial {...concrete} />
              </mesh>
              <mesh position={[0, 0.1, (1.6 - t * 0.3) / 2 + 0.005]}>
                <planeGeometry args={[1.2 - t * 0.3, 0.06]} />
                <meshBasicMaterial color={SIGNAL.clone().multiplyScalar(2)} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "fortress":
      return (
        <group>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[2.4, 0.9, 2.4]} />
            <meshStandardMaterial {...concrete} />
          </mesh>
          {[
            [-1.2, -1.2],
            [1.2, -1.2],
            [-1.2, 1.2],
            [1.2, 1.2],
          ].map(([x, z]) => (
            <mesh key={`${x}${z}`} position={[x, 0.75, z]} castShadow>
              <cylinderGeometry args={[0.32, 0.36, 1.5, 6]} />
              <meshStandardMaterial {...metal} />
            </mesh>
          ))}
          <mesh position={[0, 1.4, 0]} castShadow>
            <boxGeometry args={[1, 1.2, 1]} />
            <meshStandardMaterial {...concrete} />
          </mesh>
          {/* Escudo: a camada de risco pré-negociação (LiNe/B3). */}
          <group position={[0, 2.65, 0]}>
            <mesh>
              <torusGeometry args={[0.55, 0.05, 8, 6]} />
              <meshBasicMaterial color={ACCENT.clone().multiplyScalar(2.4)} toneMapped={false} />
            </mesh>
            <mesh>
              <circleGeometry args={[0.5, 6]} />
              <meshBasicMaterial color={ACCENT} transparent opacity={0.25} side={DoubleSide} />
            </mesh>
          </group>
        </group>
      );
    case "glasstower":
      return (
        <group>
          <mesh position={[0, 2, 0]} castShadow>
            <boxGeometry args={[1.3, 4, 1.3]} />
            <meshStandardMaterial color="#9fc6ff" metalness={0.9} roughness={0.08} transparent opacity={0.55} />
          </mesh>
          <Glow color={SIGNAL} intensity={1.6}>
            <boxGeometry args={[0.08, 3.8, 0.08]} />
          </Glow>
          <mesh ref={beacon} position={[0, 4.35, 0]}>
            <octahedronGeometry args={[0.28, 0]} />
            <meshBasicMaterial color={ACCENT.clone().multiplyScalar(3.2)} toneMapped={false} />
          </mesh>
        </group>
      );
    case "monoliths":
      // Árvore de habilidades: um monólito por skill, com a altura do nível, ligados ao núcleo.
      return (
        <group>
          {skills.map((s, i) => {
            const a = (i / skills.length) * Math.PI * 2;
            const h = 0.6 + (s.value / 100) * 2.2;
            const c = s.tone === "signal" ? SIGNAL : ACCENT;
            return (
              <group key={s.label} position={[Math.cos(a) * 1.7, 0, Math.sin(a) * 1.7]}>
                <mesh position-y={h / 2} castShadow>
                  <boxGeometry args={[0.32, h, 0.32]} />
                  <meshStandardMaterial {...concrete} />
                </mesh>
                <mesh position-y={h + 0.08}>
                  <boxGeometry args={[0.34, 0.08, 0.34]} />
                  <meshBasicMaterial color={c.clone().multiplyScalar(2.2)} toneMapped={false} />
                </mesh>
                <mesh position={[-Math.cos(a) * 0.85, 0.06, -Math.sin(a) * 0.85]} rotation-y={-a}>
                  <boxGeometry args={[1.7, 0.03, 0.04]} />
                  <meshBasicMaterial color={c.clone().multiplyScalar(1.4)} toneMapped={false} />
                </mesh>
              </group>
            );
          })}
          <mesh position-y={0.35} castShadow>
            <cylinderGeometry args={[0.4, 0.5, 0.7, 8]} />
            <meshStandardMaterial {...metal} />
          </mesh>
        </group>
      );
    case "gate":
      return (
        <group rotation-y={-0.8}>
          {[-1, 1].map((x) => (
            <mesh key={x} position={[x, 1.2, 0]} castShadow>
              <boxGeometry args={[0.35, 2.4, 0.35]} />
              <meshStandardMaterial {...concrete} />
            </mesh>
          ))}
          <mesh position={[0, 2.5, 0]} castShadow>
            <boxGeometry args={[2.6, 0.3, 0.4]} />
            <meshStandardMaterial {...concrete} />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <planeGeometry args={[1.65, 2.3]} />
            <meshBasicMaterial color={ACCENT.clone().multiplyScalar(1.1)} transparent opacity={0.22} side={DoubleSide} toneMapped={false} depthWrite={false} />
          </mesh>
        </group>
      );
  }
}

/** Névoa: opaca no centro e transparente na borda da esfera (sem contorno duro). */
function veilShader() {
  return {
    uniforms: { uColor: { value: new Color(FOG) }, uOpacity: { value: 0.9 } },
    vertexShader: `varying vec3 vNormal; varying vec3 vView;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vNormal = normalize(normalMatrix * normal); vView = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying vec3 vNormal; varying vec3 vView;
      void main(){ float facing = clamp(dot(vNormal, vView), 0.0, 1.0); gl_FragColor = vec4(uColor, uOpacity * pow(facing, 1.6)); }`,
  };
}

function IslandMesh({ island, index }: { island: Island; index: number }) {
  const group = useRef<Group>(null);
  const veil = useRef<ShaderMaterial>(null);
  const top = useRef<MeshStandardMaterial>(null);
  const colors = useMemo(() => ({ moss: new Color(MOSS), dark: new Color("#0c1219") }), []);
  useFrame(({ clock }) => {
    const r = revealOf(index);
    if (veil.current) veil.current.uniforms.uOpacity.value = (1 - r) * 0.9;
    top.current?.color.copy(colors.dark).lerp(colors.moss, r);
    if (group.current && !journey.reduced) group.current.position.y = island.y + Math.sin(clock.elapsedTime * 0.6 + index) * 0.08;
  });
  return (
    <group ref={group} position={[island.x, island.y, island.z]}>
      <mesh position-y={-0.15} receiveShadow castShadow>
        <cylinderGeometry args={[island.r, island.r * 0.94, 0.3, 10]} />
        <meshStandardMaterial ref={top} color={MOSS} flatShading roughness={0.9} />
      </mesh>
      <mesh position-y={-0.6} castShadow>
        <cylinderGeometry args={[island.r * 0.94, island.r * 0.72, 0.6, 10]} />
        <meshStandardMaterial color={STONE} flatShading roughness={0.9} />
      </mesh>
      <mesh position-y={-2.1} rotation-x={Math.PI} castShadow>
        <coneGeometry args={[island.r * 0.72, 2.4, 8]} />
        <meshStandardMaterial color={ROCK} flatShading />
      </mesh>
      <Structure kind={island.kind} />
      <Label island={island} index={index} />
      {/* Névoa de guerra: some quando a unidade chega perto; bordas esfumadas pelo ângulo de visão. */}
      <mesh scale={[island.r + 1.8, 4, island.r + 1.8]} position-y={1}>
        <sphereGeometry args={[1, 32, 20]} />
        <shaderMaterial ref={veil} args={[veilShader()]} transparent depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Rota tracejada: acesa atrás da unidade, apagada à frente. */
function Route({ curves }: { curves: QuadraticBezierCurve3[] }) {
  const ref = useRef<InstancedMesh>(null);
  const DASH = 14;
  const dashes = useMemo(
    () =>
      curves.flatMap((c, seg) =>
        Array.from({ length: DASH }, (_, k) => {
          const t = (k + 0.5) / DASH;
          return { p: c.getPoint(t), tan: c.getTangent(t), at: seg + t };
        }),
      ),
    [curves],
  );
  const tmp = useMemo(() => ({ o: new Object3D(), c: new Color(), dim: new Color("#1d3a2c") }), []);
  useEffect(() => {
    dashes.forEach((d, i) => {
      tmp.o.position.copy(d.p);
      tmp.o.lookAt(d.p.clone().add(d.tan));
      tmp.o.updateMatrix();
      ref.current?.setMatrixAt(i, tmp.o.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [dashes, tmp]);
  useFrame(() => {
    const s = journey.smooth - 1;
    dashes.forEach((d, i) => {
      const lit = d.at <= s;
      tmp.c.copy(lit ? ACCENT : tmp.dim).multiplyScalar(lit ? 2.2 : 1);
      ref.current?.setColorAt(i, tmp.c);
    });
    if (ref.current?.instanceColor) ref.current.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, dashes.length]} frustumCulled={false}>
      <boxGeometry args={[0.07, 0.04, 0.32]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

/** Fragmentos de dados ao longo da rota: a unidade coleta ao passar. */
function Shards({ curves }: { curves: QuadraticBezierCurve3[] }) {
  const ref = useRef<InstancedMesh>(null);
  const items = useMemo(
    () => curves.flatMap((c, seg) => [0.33, 0.66].map((t) => ({ p: c.getPoint(t).add(new Vector3(0, 0.7, 0)), at: seg + t }))),
    [curves],
  );
  const o = useMemo(() => new Object3D(), []);
  useFrame(({ clock }) => {
    const s = journey.smooth - 1;
    items.forEach((it, i) => {
      const taken = Math.min(1, Math.max(0, (s - it.at) * 5));
      o.position.copy(it.p);
      o.position.y += taken * 0.9 + (journey.reduced ? 0 : Math.sin(clock.elapsedTime * 2 + i) * 0.05);
      o.rotation.set(0, journey.reduced ? 0 : clock.elapsedTime * 1.5 + i, 0);
      o.scale.setScalar(Math.max(0.0001, 1 - taken));
      o.updateMatrix();
      ref.current?.setMatrixAt(i, o.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} frustumCulled={false}>
      <octahedronGeometry args={[0.14, 0]} />
      <meshBasicMaterial color={SIGNAL.clone().multiplyScalar(2.2)} toneMapped={false} />
    </instancedMesh>
  );
}

/** A unidade: cristal facetado com anel de seleção no chão. */
function Unit({ curves }: { curves: QuadraticBezierCurve3[] }) {
  const root = useRef<Group>(null);
  const crystal = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);
  const pulse = useRef<Mesh>(null);
  const light = useRef<PointLight>(null);
  const tmp = useMemo(() => new Vector3(), []);
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.1);
    const s = Math.min(curves.length - 0.0001, Math.max(0, journey.smooth - 1));
    const seg = Math.floor(s);
    curves[seg].getPoint(s - seg, tmp);
    const t = clock.elapsedTime;
    root.current?.position.set(tmp.x, tmp.y, tmp.z);
    if (crystal.current) {
      crystal.current.position.y = 0.75 + (journey.reduced ? 0 : Math.sin(t * 2) * 0.08);
      crystal.current.rotation.y += journey.reduced ? 0 : dt * (0.8 + journey.impulse * 8);
    }
    if (ring.current && !journey.reduced) ring.current.rotation.z += dt * 0.6;
    if (pulse.current) {
      const k = 1 - journey.impulse;
      pulse.current.scale.setScalar(0.6 + k * 2.4);
      (pulse.current.material as MeshBasicMaterial).opacity = journey.impulse * 0.8;
    }
    if (light.current) light.current.intensity = 4 + journey.impulse * 10;
  });
  return (
    <group ref={root}>
      <mesh ref={crystal} castShadow>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.6} flatShading toneMapped={false} />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.02}>
        <ringGeometry args={[0.42, 0.5, 6]} />
        <meshBasicMaterial color={ACCENT.clone().multiplyScalar(2)} toneMapped={false} side={DoubleSide} />
      </mesh>
      <mesh ref={pulse} rotation-x={-Math.PI / 2} position-y={0.03}>
        <ringGeometry args={[0.45, 0.52, 32]} />
        <meshBasicMaterial color={ACCENT.clone().multiplyScalar(2)} transparent opacity={0} toneMapped={false} side={DoubleSide} />
      </mesh>
      <pointLight ref={light} color="#3be87f" intensity={4} distance={5} position-y={0.8} />
    </group>
  );
}

function ImpulseDecay() {
  useFrame((_, delta) => {
    journey.impulse = Math.max(0, journey.impulse - Math.min(delta, 0.1) * 1.1);
  });
  return null;
}

const KEYS: CameraKey[] = [
  { pos: [-2, 17, 33], look: [0, 1, 4] },
  ...ISLANDS.map((i): CameraKey => {
    // A câmera do BTG sai do eixo da torre do Itaú, que ficava colada nela.
    const [dx, dy, dz] = i.cam ?? [6.5, 5.8, 9.5];
    return { pos: [i.x + dx, i.y + dy, i.z + dz], look: [i.x - 2.2, i.y + 1, i.z - 0.5] };
  }),
];

/** Estratégia: o arquipélago em tom sério, com névoa de guerra e uma unidade avançando pela campanha. */
export default function EstrategiaScene(props: WorldSceneProps) {
  const curves = useMemo(() => ISLANDS.slice(0, -1).map((_, i) => route(i)), []);
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
    <WorldCanvas {...props} background={BG} fov={40} shadows>
      <ImpulseDecay />
      <fog attach="fog" args={["#0f1d30", 34, 110]} />
      <Sky />
      <hemisphereLight args={["#3b5f86", "#04060a", 0.7]} />
      <directionalLight
        position={[-12, 20, 8]}
        intensity={1.5}
        color="#a9c2ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <CameraRig keys={KEYS} parallax={[0.8, 0.45]} />
      {ISLANDS.map((island, i) => (
        <IslandMesh key={island.code} island={island} index={i} />
      ))}
      <Route curves={curves} />
      <Shards curves={curves} />
      <Unit curves={curves} />
      {!props.device.low && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.2} intensity={0.85} radius={0.65} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette darkness={0.6} offset={0.25} />
          <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
        </EffectComposer>
      )}
    </WorldCanvas>
  );
}
