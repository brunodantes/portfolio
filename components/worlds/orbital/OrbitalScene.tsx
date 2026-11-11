"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  CubicBezierCurve3,
  DoubleSide,
  type Group,
  type InstancedMesh,
  type Mesh,
  type MeshBasicMaterial,
  Object3D,
  type PointLight,
  Quaternion,
  SRGBColorSpace,
  Vector2,
  Vector3,
} from "three";
import { useContent } from "@/lib/preferences";
import CameraRig, { type CameraKey } from "../engine/CameraRig";
import { journey } from "../engine/journey";
import WorldCanvas from "../engine/WorldCanvas";
import type { WorldSceneProps } from "../engine/types";
import { BODIES, bodyPosition, type Body } from "./layout";

const BG = "#03040a";
const TEAL = new Color("#5ef2d6");
const STAR = new Color("#ffcf7a");

const reachOf = (index: number) => Math.min(1, Math.max(0, (journey.smooth - index + 0.2) * 1.4));

function radialTexture(inner: string, outer: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function Starfield() {
  const positions = useMemo(() => {
    let s = 12;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const arr = new Float32Array(2600 * 3);
    for (let i = 0; i < 2600; i++) {
      const u = r() * Math.PI * 2;
      const v = Math.acos(2 * r() - 1);
      const d = 70 + r() * 40;
      arr[i * 3] = Math.sin(v) * Math.cos(u) * d;
      arr[i * 3 + 1] = Math.cos(v) * d;
      arr[i * 3 + 2] = Math.sin(v) * Math.sin(u) * d;
    }
    return arr;
  }, []);
  const nebula = useMemo(
    () => [radialTexture("rgba(94,242,214,0.35)", "rgba(94,242,214,0)"), radialTexture("rgba(140,90,220,0.35)", "rgba(140,90,220,0)")],
    [],
  );
  useEffect(() => () => nebula.forEach((t) => t.dispose()), [nebula]);
  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#e6eeff" size={0.35} sizeAttenuation transparent opacity={0.85} />
      </points>
      <mesh position={[-40, 10, -60]} rotation-y={0.5}>
        <planeGeometry args={[90, 60]} />
        <meshBasicMaterial map={nebula[0]} transparent depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      <mesh position={[45, -12, -50]} rotation-y={-0.6}>
        <planeGeometry args={[80, 55]} />
        <meshBasicMaterial map={nebula[1]} transparent depthWrite={false} blending={AdditiveBlending} />
      </mesh>
    </>
  );
}

/** A estrela no centro do sistema, com halo. */
function Sun() {
  const halo = useMemo(() => radialTexture("rgba(255,207,122,0.9)", "rgba(255,150,60,0)"), []);
  useEffect(() => () => halo.dispose(), [halo]);
  const glow = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  useFrame(({ camera, clock }) => {
    glow.current?.quaternion.copy(camera.quaternion);
    const flare = 1 + journey.impulse * 0.6 + (journey.reduced ? 0 : Math.sin(clock.elapsedTime * 1.5) * 0.03);
    glow.current?.scale.setScalar(flare);
    if (light.current) light.current.intensity = 170 * flare;
  });
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[1.6, 3]} />
        <meshBasicMaterial color={STAR.clone().multiplyScalar(3)} toneMapped={false} />
      </mesh>
      <group ref={glow}>
        <mesh>
          <planeGeometry args={[9, 9]} />
          <meshBasicMaterial map={halo} transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
        </mesh>
      </group>
      <pointLight ref={light} color="#ffd9a0" intensity={170} distance={60} decay={1.6} />
    </group>
  );
}

/** Órbitas: as já percorridas ficam acesas. */
function Orbits() {
  const refs = useRef<(MeshBasicMaterial | null)[]>([]);
  useFrame(() => {
    refs.current.forEach((m, i) => {
      if (m) m.opacity = 0.08 + reachOf(i) * 0.3;
    });
  });
  return (
    <>
      {BODIES.map((b, i) => (
        <mesh key={b.code} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[b.radius - 0.02, b.radius + 0.02, 160]} />
          <meshBasicMaterial
            ref={(m) => {
              refs.current[i] = m;
            }}
            color={TEAL}
            transparent
            opacity={0.1}
            side={DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

function makeLabel(b: Body) {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 150;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(3,4,10,0.75)";
  g.fillRect(0, 0, 640, 150);
  g.fillStyle = "#5ef2d6";
  g.fillRect(0, 0, 8, 150);
  g.font = "500 38px monospace";
  g.fillStyle = "#5ef2d6";
  g.fillText(b.code, 34, 52);
  g.font = "700 58px sans-serif";
  g.fillStyle = "#eef4ff";
  g.fillText(b.label, 34, 120);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function Label({ body, index, offset }: { body: Body; index: number; offset: number }) {
  const texture = useMemo(() => makeLabel(body), [body]);
  useEffect(() => () => texture.dispose(), [texture]);
  const group = useRef<Group>(null);
  const mat = useRef<MeshBasicMaterial>(null);
  useFrame(({ camera }) => {
    group.current?.quaternion.copy(camera.quaternion);
    if (mat.current) mat.current.opacity = 0.35 + reachOf(index) * 0.65;
  });
  return (
    <group ref={group} position-y={offset}>
      <mesh>
        <planeGeometry args={[2.6, 0.61]} />
        <meshBasicMaterial ref={mat} map={texture} transparent toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Corpos celestes: lua, planetas, gigante com anéis e o planeta com estação (o atual). */
function CelestialBody({ body, index }: { body: Body; index: number }) {
  const spin = useRef<Mesh>(null);
  const station = useRef<Group>(null);
  const pos = useMemo(() => bodyPosition(body), [body]);
  useFrame((_, delta) => {
    const dt = journey.reduced ? 0 : Math.min(delta, 0.1);
    if (spin.current) spin.current.rotation.y += dt * 0.25;
    if (station.current) station.current.rotation.y += dt * 0.6;
  });
  if (body.kind === "constellation" || body.kind === "gate") return null;
  return (
    <group position={pos}>
      <mesh ref={spin} castShadow>
        <icosahedronGeometry args={[body.size, body.kind === "giant" ? 2 : 1]} />
        <meshStandardMaterial color={body.color} flatShading roughness={0.85} />
      </mesh>
      {body.kind === "giant" && (
        <mesh rotation={[-1.2, 0.2, 0]}>
          <ringGeometry args={[body.size * 1.4, body.size * 2.1, 64]} />
          <meshStandardMaterial color="#c8b6ee" transparent opacity={0.55} side={DoubleSide} />
        </mesh>
      )}
      {body.kind === "station" && (
        <group ref={station}>
          <group position={[body.size * 1.9, 0.3, 0]}>
            <mesh rotation-x={Math.PI / 2}>
              <torusGeometry args={[0.38, 0.06, 8, 24]} />
              <meshStandardMaterial color="#d6dde8" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.76, 0.05, 0.05]} />
              <meshStandardMaterial color="#d6dde8" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position-y={0.25}>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshBasicMaterial color={TEAL.clone().multiplyScalar(3)} toneMapped={false} />
            </mesh>
          </group>
        </group>
      )}
      <Label body={body} index={index} offset={body.size + 1.1} />
    </group>
  );
}

/** Constelação da stack: uma estrela por skill (maior = mais nível), ligadas como uma árvore. */
function Constellation() {
  const { skills } = useContent();
  const body = BODIES[5];
  const pos = bodyPosition(body);
  const stars = useMemo(
    () =>
      skills.map((s, i) => {
        const a = (i / skills.length) * Math.PI * 2;
        const r = 1 + (i % 2) * 0.7;
        return { p: new Vector3(Math.cos(a) * r, Math.sin(i * 1.3) * 0.6 + 0.6, Math.sin(a) * r), size: 0.06 + (s.value / 100) * 0.14, signal: s.tone === "signal" };
      }),
    [skills],
  );
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    const here = Math.max(0, 1 - Math.abs(journey.smooth - 6) * 1.2);
    if (group.current) {
      group.current.scale.setScalar(0.6 + here * 0.5);
      if (!journey.reduced) group.current.rotation.y = clock.elapsedTime * 0.15;
    }
  });
  return (
    <group position={pos}>
      <group ref={group}>
        {stars.map((s, i) => (
          <group key={i}>
            <mesh position={s.p}>
              <sphereGeometry args={[s.size, 12, 12]} />
              <meshBasicMaterial color={(s.signal ? STAR : TEAL).clone().multiplyScalar(3)} toneMapped={false} />
            </mesh>
            <Link a={CENTER} b={s.p} />
          </group>
        ))}
        <mesh position-y={0.6}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshBasicMaterial color={TEAL.clone().multiplyScalar(2.5)} toneMapped={false} />
        </mesh>
      </group>
      <Label body={body} index={5} offset={2.6} />
    </group>
  );
}

const CENTER = new Vector3(0, 0.6, 0);
const Z_AXIS = new Vector3(0, 0, 1);

/** Ligação entre o núcleo e uma estrela da constelação (orientada no espaço local). */
function Link({ a, b }: { a: Vector3; b: Vector3 }) {
  const { mid, len, quaternion } = useMemo(() => {
    const dir = b.clone().sub(a);
    return {
      mid: a.clone().lerp(b, 0.5),
      len: dir.length(),
      quaternion: new Quaternion().setFromUnitVectors(Z_AXIS, dir.normalize()),
    };
  }, [a, b]);
  return (
    <mesh position={mid} quaternion={quaternion}>
      <boxGeometry args={[0.012, 0.012, len]} />
      <meshBasicMaterial color={TEAL} transparent opacity={0.5} />
    </mesh>
  );
}

/** Portal de dobra do contato: anel e disco girando. */
function WarpGate() {
  const body = BODIES[6];
  const pos = bodyPosition(body);
  const disc = useRef<Mesh>(null);
  const tex = useMemo(() => radialTexture("rgba(255,255,255,0.95)", "rgba(94,242,214,0.15)"), []);
  useEffect(() => () => tex.dispose(), [tex]);
  useFrame(({ clock }) => {
    if (disc.current && !journey.reduced) {
      disc.current.rotation.z = clock.elapsedTime * 1.2;
      disc.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2) * 0.04);
    }
  });
  return (
    <group position={pos} rotation-y={-0.9}>
      <mesh>
        <torusGeometry args={[body.size, 0.12, 12, 8]} />
        <meshStandardMaterial color="#cfd8e6" metalness={0.9} roughness={0.25} emissive={TEAL} emissiveIntensity={0.4} flatShading />
      </mesh>
      <mesh ref={disc}>
        <circleGeometry args={[body.size * 0.92, 48]} />
        <meshBasicMaterial map={tex} color={TEAL.clone().multiplyScalar(1.6)} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} side={DoubleSide} />
      </mesh>
      <Label body={body} index={6} offset={body.size + 1} />
    </group>
  );
}

/** Rotas de transferência entre corpos: arcos que contornam a estrela. */
function buildTransfers() {
  return BODIES.slice(0, -1).map((b, i) => {
    const a = new Vector3(...bodyPosition(b));
    const c = new Vector3(...bodyPosition(BODIES[i + 1]));
    const out = (v: Vector3, k: number) => v.clone().setY(0).normalize().multiplyScalar(k);
    const start = a.clone().add(out(a, b.size + 0.5));
    const end = c.clone().add(out(c, BODIES[i + 1].size + 0.5));
    return new CubicBezierCurve3(start, start.clone().add(out(a, 3)).setY(start.y + 1.2), end.clone().add(out(c, 3)).setY(end.y + 1.2), end);
  });
}

function TransferLines({ curves }: { curves: CubicBezierCurve3[] }) {
  const ref = useRef<InstancedMesh>(null);
  const PER = 40;
  const dots = useMemo(() => curves.flatMap((c, seg) => Array.from({ length: PER }, (_, k) => ({ p: c.getPoint(k / PER), at: seg + k / PER }))), [curves]);
  const tmp = useMemo(() => ({ o: new Object3D(), c: new Color(), dim: new Color("#12403a") }), []);
  useEffect(() => {
    dots.forEach((d, i) => {
      tmp.o.position.copy(d.p);
      tmp.o.updateMatrix();
      ref.current?.setMatrixAt(i, tmp.o.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [dots, tmp]);
  useFrame(() => {
    const s = journey.smooth - 1;
    dots.forEach((d, i) => ref.current?.setColorAt(i, tmp.c.copy(d.at <= s ? TEAL : tmp.dim).multiplyScalar(d.at <= s ? 2 : 1)));
    if (ref.current?.instanceColor) ref.current.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, dots.length]} frustumCulled={false}>
      <sphereGeometry args={[0.035, 6, 6]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

/** A nave: avança pelas transferências conforme o scroll, com rastro do motor. */
function Ship({ curves }: { curves: CubicBezierCurve3[] }) {
  const root = useRef<Group>(null);
  const flame = useRef<Mesh>(null);
  const trail = useRef<InstancedMesh>(null);
  const TRAIL = 18;
  const tmp = useMemo(() => ({ p: new Vector3(), q: new Vector3(), o: new Object3D() }), []);
  const at = (s: number, out: Vector3) => {
    const seg = Math.min(curves.length - 1, Math.max(0, Math.floor(s)));
    return curves[seg].getPoint(Math.min(1, Math.max(0, s - seg)), out);
  };
  useFrame(({ clock }) => {
    const s = Math.min(curves.length - 0.001, Math.max(0, journey.smooth - 1));
    at(s, tmp.p);
    at(s + 0.01, tmp.q);
    const g = root.current;
    if (!g) return;
    g.position.copy(tmp.p);
    if (tmp.q.distanceToSquared(tmp.p) > 1e-8) g.lookAt(tmp.q);
    if (flame.current) {
      const boost = 1 + journey.impulse * 2 + (journey.reduced ? 0 : Math.sin(clock.elapsedTime * 30) * 0.1);
      flame.current.scale.set(1, 1, boost);
    }
    for (let k = 0; k < TRAIL; k++) {
      at(Math.max(0, s - (k + 1) * 0.012), tmp.q);
      tmp.o.position.copy(tmp.q);
      tmp.o.scale.setScalar(Math.max(0.05, 1 - k / TRAIL));
      tmp.o.updateMatrix();
      trail.current?.setMatrixAt(k, tmp.o.matrix);
    }
    if (trail.current) trail.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <group ref={root} scale={0.55}>
        <mesh rotation-x={Math.PI / 2}>
          <coneGeometry args={[0.22, 0.8, 4]} />
          <meshStandardMaterial color="#dfe6f0" metalness={0.7} roughness={0.3} flatShading />
        </mesh>
        <mesh position-z={-0.15}>
          <boxGeometry args={[0.9, 0.04, 0.3]} />
          <meshStandardMaterial color="#9aa6b8" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh ref={flame} position-z={-0.5} rotation-x={-Math.PI / 2}>
          <coneGeometry args={[0.12, 0.45, 8]} />
          <meshBasicMaterial color={TEAL.clone().multiplyScalar(3)} toneMapped={false} />
        </mesh>
      </group>
      <instancedMesh ref={trail} args={[undefined, undefined, TRAIL]} frustumCulled={false}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={TEAL.clone().multiplyScalar(1.8)} transparent opacity={0.6} toneMapped={false} />
      </instancedMesh>
    </>
  );
}

function ImpulseDecay() {
  useFrame((_, delta) => {
    journey.impulse = Math.max(0, journey.impulse - Math.min(delta, 0.1) * 1.2);
  });
  return null;
}

/** Câmera: vista do sistema e, em cada capítulo, entre a estrela e o corpo, com o corpo à direita do texto. */
function buildKeys(): CameraKey[] {
  const up = new Vector3(0, 1, 0);
  return [
    { pos: [0, 30, 36], look: [0, -2, 2] },
    ...BODIES.map((b): CameraKey => {
      const B = new Vector3(...bodyPosition(b));
      const out = B.clone().setY(0).normalize();
      // Por dentro da órbita, de costas para a estrela: o lado iluminado fica de frente para a câmera.
      const tangent = new Vector3(-out.z, 0, out.x);
      const P = B.clone()
        // Nos corpos perto da estrela a câmera vai mais para o lado, para não entrar no halo.
        .addScaledVector(out, -Math.min(4.2 + b.size * 2.2, b.radius * 0.4))
        .addScaledVector(tangent, b.radius < 10 ? 4.5 : 1.6)
        .add(new Vector3(0, 1.8 + b.size * 0.8, 0));
      const forward = B.clone().sub(P).normalize();
      const right = forward.clone().cross(up).normalize();
      const look = B.clone().addScaledVector(right, -(1.6 + b.size * 0.8));
      return { pos: [P.x, P.y, P.z], look: [look.x, look.y, look.z] };
    }),
  ];
}

/** Mapa orbital: a carreira como um sistema estelar percorrido por uma nave. */
export default function OrbitalScene(props: WorldSceneProps) {
  const curves = useMemo(() => buildTransfers(), []);
  const keys = useMemo(() => buildKeys(), []);
  const offset = useMemo(() => new Vector2(0.0006, 0.0004), []);
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
    <WorldCanvas {...props} background={BG} fov={42}>
      <ImpulseDecay />
      <ambientLight intensity={0.12} />
      <CameraRig keys={keys} parallax={[0.9, 0.5]} />
      <Starfield />
      <Sun />
      <Orbits />
      {BODIES.map((b, i) => (
        <CelestialBody key={b.code} body={b} index={i} />
      ))}
      <Constellation />
      <WarpGate />
      <TransferLines curves={curves} />
      <Ship curves={curves} />
      {!props.device.low && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={1} radius={0.75} />
          <ChromaticAberration offset={offset} radialModulation={false} modulationOffset={0} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette darkness={0.6} offset={0.25} />
          <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
        </EffectComposer>
      )}
    </WorldCanvas>
  );
}
