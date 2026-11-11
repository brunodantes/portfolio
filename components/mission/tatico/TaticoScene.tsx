"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Scanline, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  DoubleSide,
  ExtrudeGeometry,
  type Group,
  type InstancedMesh,
  type Mesh,
  type MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  SRGBColorSpace,
  type ShaderMaterial,
  Shape,
  Vector2,
  Vector3,
} from "three";
import { useContent } from "@/lib/preferences";
import CameraRig, { type CameraKey } from "../CameraRig";
import { journey } from "../journey";
import WorldCanvas from "../WorldCanvas";
import type { WorldSceneProps } from "../types";
import { OPS, TABLE, heightAt, type Op } from "./layout";

const BG = "#03060c";
const HOLO = new Color("#4cc9f0");
const AMBER = new Color("#ffb347");

/** Quanto a operação já foi alcançada (as próximas ficam apagadas). */
const reachOf = (index: number) => Math.min(1, Math.max(0, (journey.smooth - index + 0.2) * 1.4));

/** Relevo holográfico: curvas de nível, grade e uma varredura de radar passando. */
function Terrain() {
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(TABLE.w, TABLE.d, 180, 120);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const material = useRef<ShaderMaterial>(null);
  const args = useMemo(
    () => ({
      uniforms: { uTime: { value: 0 }, uColor: { value: HOLO.clone() }, uPulse: { value: 0 } },
      vertexShader: `varying float vH; varying vec3 vW;
        void main(){ vH = position.y; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform float uTime; uniform vec3 uColor; uniform float uPulse; varying float vH; varying vec3 vW;
        float lineOf(float v){ float f = fract(v); float d = min(f, 1.0 - f) / max(fwidth(v), 1e-4); return 1.0 - clamp(d, 0.0, 1.0); }
        void main(){
          float contour = lineOf(vH * 5.0);
          float major = lineOf(vH * 1.25);
          float grid = max(lineOf(vW.x * 0.5), lineOf(vW.z * 0.5)) * 0.35;
          float sweepX = mod(uTime * 4.0, 44.0) - 22.0;
          float sweep = exp(-pow((vW.x - sweepX) * 0.5, 2.0));
          float edge = smoothstep(15.0, 13.0, abs(vW.x)) * smoothstep(10.0, 8.5, abs(vW.z));
          float a = (0.05 + contour * 0.45 + major * 0.5 + grid + sweep * 0.25 + uPulse * 0.3) * edge;
          gl_FragColor = vec4(uColor * (0.5 + contour + major * 1.6 + sweep * 1.2 + uPulse), a);
        }`,
    }),
    [],
  );
  useFrame(({ clock }) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = journey.reduced ? 2 : clock.elapsedTime;
    material.current.uniforms.uPulse.value = journey.impulse;
  });
  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        ref={material}
        args={[args]}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        side={DoubleSide}
      />
    </mesh>
  );
}

/** A mesa física: tampo escuro com borda acesa. */
function Table() {
  return (
    <group>
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[TABLE.w + 2, 0.6, TABLE.d + 2]} />
        <meshStandardMaterial color="#0a0f18" metalness={0.7} roughness={0.4} />
      </mesh>
      {[
        [0, (TABLE.d + 2) / 2, TABLE.w + 2, 0.04],
        [0, -(TABLE.d + 2) / 2, TABLE.w + 2, 0.04],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, -0.04, z]}>
          <boxGeometry args={[w, 0.03, d]} />
          <meshBasicMaterial color={HOLO.clone().multiplyScalar(2)} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, -0.66, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#05080e" />
      </mesh>
    </group>
  );
}

function makeLabel(op: Op) {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 176;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(3,10,18,0.8)";
  g.fillRect(0, 0, 768, 176);
  g.strokeStyle = "#4cc9f0";
  g.lineWidth = 3;
  g.strokeRect(2, 2, 764, 172);
  g.font = "600 40px monospace";
  g.fillStyle = "#ffb347";
  g.fillText(op.code, 32, 56);
  g.fillStyle = "#4cc9f0";
  g.fillText(op.sub, 768 - 32 - g.measureText(op.sub).width, 56);
  g.font = "700 64px sans-serif";
  g.fillStyle = "#e6f6ff";
  g.fillText(op.label, 32, 140);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Marcador de operação: pilar hexagonal holográfico, anel no chão e etiqueta. */
function Marker({ op, index }: { op: Op; index: number }) {
  const label = useMemo(() => makeLabel(op), [op]);
  useEffect(() => () => label.dispose(), [label]);
  const y = heightAt(op.x, op.z);
  const pillar = useRef<MeshBasicMaterial>(null);
  const tag = useRef<Group>(null);
  const tagMat = useRef<MeshBasicMaterial>(null);
  const ring = useRef<Mesh>(null);
  useFrame(({ camera, clock }) => {
    const r = reachOf(index);
    const here = Math.max(0, 1 - Math.abs(journey.smooth - (index + 1)) * 1.3);
    if (pillar.current) pillar.current.opacity = 0.12 + r * 0.25 + here * 0.25;
    if (tagMat.current) tagMat.current.opacity = 0.3 + r * 0.7;
    tag.current?.quaternion.copy(camera.quaternion);
    if (ring.current) {
      const t = journey.reduced ? 0.5 : (clock.elapsedTime * 0.7 + index * 0.3) % 1;
      ring.current.scale.setScalar(0.6 + t * 1.6);
      (ring.current.material as MeshBasicMaterial).opacity = (1 - t) * (0.25 + here * 0.6);
    }
  });
  return (
    <group position={[op.x, y, op.z]}>
      {op.kind === "op" && (
        <mesh position-y={0.9}>
          <cylinderGeometry args={[0.55, 0.55, 1.8, 6, 1, true]} />
          <meshBasicMaterial ref={pillar} color={HOLO} transparent opacity={0.3} side={DoubleSide} depthWrite={false} blending={AdditiveBlending} />
        </mesh>
      )}
      <mesh rotation-x={-Math.PI / 2} position-y={0.04}>
        <ringGeometry args={[0.6, 0.66, 6]} />
        <meshBasicMaterial color={HOLO.clone().multiplyScalar(2.2)} toneMapped={false} side={DoubleSide} />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.05}>
        <ringGeometry args={[0.6, 0.64, 48]} />
        <meshBasicMaterial color={HOLO.clone().multiplyScalar(2)} transparent opacity={0.4} toneMapped={false} side={DoubleSide} />
      </mesh>
      <group ref={tag} position-y={op.kind === "radar" ? 3.6 : 2.6}>
        <mesh>
          <planeGeometry args={[2.8, 0.64]} />
          <meshBasicMaterial ref={tagMat} map={label} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Rota do briefing: segmentos sobre o relevo, acesos até o marcador. */
function Route() {
  const ref = useRef<InstancedMesh>(null);
  const PER = 18;
  const dashes = useMemo(() => {
    const list: { p: Vector3; next: Vector3; at: number }[] = [];
    for (let s = 0; s < OPS.length - 1; s++) {
      const a = OPS[s];
      const b = OPS[s + 1];
      for (let k = 0; k < PER; k++) {
        const t = (k + 0.5) / PER;
        const t2 = Math.min(1, t + 0.02);
        const x = a.x + (b.x - a.x) * t;
        const z = a.z + (b.z - a.z) * t;
        const x2 = a.x + (b.x - a.x) * t2;
        const z2 = a.z + (b.z - a.z) * t2;
        list.push({ p: new Vector3(x, heightAt(x, z) + 0.06, z), next: new Vector3(x2, heightAt(x2, z2) + 0.06, z2), at: s + t });
      }
    }
    return list;
  }, []);
  const tmp = useMemo(() => ({ o: new Object3D(), c: new Color(), dim: new Color("#3a2a12") }), []);
  useEffect(() => {
    dashes.forEach((d, i) => {
      tmp.o.position.copy(d.p);
      tmp.o.lookAt(d.next);
      tmp.o.updateMatrix();
      ref.current?.setMatrixAt(i, tmp.o.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [dashes, tmp]);
  useFrame(() => {
    const s = journey.smooth - 1;
    dashes.forEach((d, i) => {
      const lit = d.at <= s;
      ref.current?.setColorAt(i, tmp.c.copy(lit ? AMBER : tmp.dim).multiplyScalar(lit ? 2.4 : 1));
    });
    if (ref.current?.instanceColor) ref.current.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, dashes.length]} frustumCulled={false}>
      <boxGeometry args={[0.06, 0.03, 0.22]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

/** Marcador da unidade (âmbar), deslizando pela rota. */
function UnitToken() {
  const root = useRef<Group>(null);
  const tmp = useMemo(() => ({ p: new Vector3(), n: new Vector3() }), []);
  const at = (s: number, out: Vector3) => {
    const seg = Math.min(OPS.length - 2, Math.max(0, Math.floor(s)));
    const f = Math.min(1, Math.max(0, s - seg));
    const a = OPS[seg];
    const b = OPS[seg + 1];
    const x = a.x + (b.x - a.x) * f;
    const z = a.z + (b.z - a.z) * f;
    return out.set(x, heightAt(x, z), z);
  };
  useFrame(({ clock }) => {
    const s = Math.max(0, journey.smooth - 1);
    at(s, tmp.p);
    at(s + 0.03, tmp.n);
    const g = root.current;
    if (!g) return;
    g.position.copy(tmp.p);
    g.position.y += 0.35 + (journey.reduced ? 0 : Math.sin(clock.elapsedTime * 3) * 0.05);
    if (tmp.n.distanceToSquared(tmp.p) > 1e-6) g.lookAt(tmp.n.x, g.position.y, tmp.n.z);
    g.scale.setScalar(1 + journey.impulse * 0.6);
  });
  return (
    <group ref={root}>
      <mesh rotation-x={Math.PI / 2}>
        <coneGeometry args={[0.28, 0.6, 3]} />
        <meshBasicMaterial color={AMBER.clone().multiplyScalar(2.6)} toneMapped={false} />
      </mesh>
      <pointLight color="#ffb347" intensity={3} distance={4} />
    </group>
  );
}

/** Radar da stack: um polígono com o nível de cada skill, erguido sobre a mesa. */
function Radar() {
  const { skills } = useContent();
  const op = OPS[4];
  const y = heightAt(op.x, op.z);
  const geometry = useMemo(() => {
    const shape = new Shape();
    skills.forEach((s, i) => {
      const a = (i / skills.length) * Math.PI * 2 + Math.PI / 2;
      const r = 0.4 + (s.value / 100) * 2;
      const p = new Vector2(Math.cos(a) * r, Math.sin(a) * r);
      if (i === 0) shape.moveTo(p.x, p.y);
      else shape.lineTo(p.x, p.y);
    });
    shape.closePath();
    return new ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false });
  }, [skills]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    const here = Math.max(0, 1 - Math.abs(journey.smooth - 5) * 1.2);
    if (group.current) {
      group.current.scale.setScalar(0.35 + here * 0.45);
      if (!journey.reduced) group.current.rotation.y = clock.elapsedTime * 0.25;
    }
  });
  return (
    <group position={[op.x, y + 1.6, op.z]}>
      <group ref={group}>
        <group rotation-x={-0.35}>
          <mesh geometry={geometry}>
            <meshBasicMaterial color={AMBER} transparent opacity={0.22} side={DoubleSide} depthWrite={false} />
          </mesh>
          {skills.map((s, i) => {
            const a = (i / skills.length) * Math.PI * 2 + Math.PI / 2;
            return (
              <mesh key={s.label} position={[Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0.05]} rotation-z={a}>
                <boxGeometry args={[2.4, 0.015, 0.015]} />
                <meshBasicMaterial color={HOLO.clone().multiplyScalar(1.6)} toneMapped={false} />
              </mesh>
            );
          })}
        </group>
      </group>
    </group>
  );
}

/** Farol do contato: coluna de luz e anéis subindo. */
function Beacon() {
  const op = OPS[5];
  const y = heightAt(op.x, op.z);
  const rings = useRef<(Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    rings.current.forEach((r, i) => {
      if (!r) return;
      const t = journey.reduced ? i / 3 : (clock.elapsedTime * 0.4 + i / 3) % 1;
      r.position.y = t * 5;
      (r.material as MeshBasicMaterial).opacity = (1 - t) * 0.7;
    });
  });
  return (
    <group position={[op.x, y, op.z]}>
      <mesh position-y={3}>
        <cylinderGeometry args={[0.18, 0.4, 6, 16, 1, true]} />
        <meshBasicMaterial color={AMBER} transparent opacity={0.25} side={DoubleSide} depthWrite={false} blending={AdditiveBlending} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            rings.current[i] = el;
          }}
          rotation-x={-Math.PI / 2}
        >
          <ringGeometry args={[0.5, 0.56, 32]} />
          <meshBasicMaterial color={AMBER.clone().multiplyScalar(2)} transparent toneMapped={false} side={DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function ImpulseDecay() {
  useFrame((_, delta) => {
    journey.impulse = Math.max(0, journey.impulse - Math.min(delta, 0.1) * 1.3);
  });
  return null;
}

/** Câmera inclinada sobre a mesa, como num briefing; o marcador fica à direita do texto. */
const KEYS: CameraKey[] = [
  { pos: [-4, 22, 20], look: [0, 0, 0] },
  ...OPS.map((o): CameraKey => {
    const y = heightAt(o.x, o.z);
    return { pos: [o.x + 3.5, y + 7.5, o.z + 8.5], look: [o.x - 2.6, y + 0.6, o.z] };
  }),
];

/** Sala tática: a carreira como operações num mapa holográfico. */
export default function TaticoScene(props: WorldSceneProps) {
  const offset = useMemo(() => new Vector2(0.0007, 0.0004), []);
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
    <WorldCanvas {...props} background={BG} fov={40}>
      <ImpulseDecay />
      <fog attach="fog" args={[BG, 30, 70]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={30} distance={40} color="#4cc9f0" />
      <CameraRig keys={KEYS} parallax={[0.8, 0.5]} />
      <Table />
      <Terrain />
      {OPS.map((op, i) => (
        <Marker key={op.code} op={op} index={i} />
      ))}
      <Route />
      <UnitToken />
      <Radar />
      <Beacon />
      {!props.device.low && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.9} radius={0.65} />
          <ChromaticAberration offset={offset} radialModulation={false} modulationOffset={0} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Scanline density={1.3} opacity={0.06} blendFunction={BlendFunction.OVERLAY} />
          <Vignette darkness={0.65} offset={0.25} />
          <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
        </EffectComposer>
      )}
    </WorldCanvas>
  );
}
