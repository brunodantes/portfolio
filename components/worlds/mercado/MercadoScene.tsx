"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, Scanline, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode, type BloomEffect } from "postprocessing";
import {
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  type Group,
  type InstancedMesh,
  type Mesh,
  Object3D,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
  TubeGeometry,
  Vector3,
} from "three";
import { useContent } from "@/lib/preferences";
import CameraRig, { type CameraKey } from "../engine/CameraRig";
import { journey } from "../engine/journey";
import WorldCanvas from "../engine/WorldCanvas";
import type { WorldSceneProps } from "../engine/types";

const BG = "#050608";
const UP = new Color("#00e08a");
const DOWN = new Color("#ff4561");
const AMBER = new Color("#ffb000");

const N = 172;
const SPACING = 0.5;
const X0 = -((N - 1) * SPACING) / 2;
const xAt = (i: number) => X0 + i * SPACING;

/** Candle de cada capítulo da carreira (origem → Itaú). Neles o preço rompe para cima. */
const MILESTONES = [
  { index: 12, label: "ETEC", sub: "2014" },
  { index: 36, label: "NESTLÉ", sub: "2016–2017" },
  { index: 72, label: "SINQIA", sub: "2018–2023" },
  { index: 120, label: "BTG PACTUAL", sub: "2023–2026" },
  { index: 152, label: "ITAÚ", sub: "2026 →" },
];

/** Série de preços determinística: passeio aleatório com tendência de alta e rompimentos nos marcos. */
function buildSeries() {
  let seed = 9;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const open = new Float32Array(N);
  const close = new Float32Array(N);
  const high = new Float32Array(N);
  const low = new Float32Array(N);
  const breakout = new Set(MILESTONES.map((m) => m.index));
  let price = 1.2;
  for (let i = 0; i < N; i++) {
    open[i] = price;
    const move = breakout.has(i) ? 1.15 + r() * 0.3 : (r() - 0.47) * 0.42 + 0.018;
    price = Math.max(0.4, price + move);
    close[i] = price;
    high[i] = Math.max(open[i], close[i]) + r() * 0.22;
    low[i] = Math.min(open[i], close[i]) - r() * 0.22;
  }
  // Média móvel de 12 períodos.
  const ma: Vector3[] = [];
  for (let i = 0; i < N; i++) {
    let sum = 0;
    let n = 0;
    for (let k = Math.max(0, i - 11); k <= i; k++, n++) sum += close[k];
    ma.push(new Vector3(xAt(i), sum / n, 0));
  }
  return { open, close, high, low, ma };
}

/** Índice do candle "atual" para o capítulo contínuo: o gráfico se desenha conforme o scroll. */
function frontierFor(chapter: number) {
  const stops = [4, ...MILESTONES.map((m) => m.index), N - 1, N - 1];
  const i = Math.min(stops.length - 2, Math.max(0, Math.floor(chapter)));
  const f = Math.min(1, Math.max(0, chapter - i));
  return stops[i] + (stops[i + 1] - stops[i]) * f;
}

function Candles({ series }: { series: ReturnType<typeof buildSeries> }) {
  const bodies = useRef<InstancedMesh>(null);
  const wicks = useRef<InstancedMesh>(null);
  const tmp = useMemo(() => ({ o: new Object3D(), c: new Color() }), []);
  const milestoneSet = useMemo(() => new Set(MILESTONES.map((m) => m.index)), []);

  useFrame(() => {
    const frontier = frontierFor(journey.smooth) + 0.999;
    for (let i = 0; i < N; i++) {
      // Candles depois da fronteira ainda não "aconteceram": aparecem como fantasmas apagados.
      const happened = Math.min(1, Math.max(0, frontier - i));
      const grow = 1;
      const o = series.open[i];
      const c = series.close[i];
      const up = c >= o;
      const h = Math.max(0.04, Math.abs(c - o)) * grow;
      tmp.o.position.set(xAt(i), Math.min(o, c) + h / 2, 0);
      tmp.o.scale.set(1, h, 1);
      tmp.o.updateMatrix();
      bodies.current?.setMatrixAt(i, tmp.o.matrix);
      const age = frontier - i;
      const fresh = Math.max(0, 1 - age / 14);
      const hot = milestoneSet.has(i) ? 2.6 : 1 + fresh * 1.4;
      tmp.c.copy(up ? UP : DOWN).multiplyScalar(happened > 0 ? hot * (0.45 + 0.55 * happened) : 0.2);
      bodies.current?.setColorAt(i, tmp.c);

      const wh = (series.high[i] - series.low[i]) * grow;
      tmp.o.position.set(xAt(i), series.low[i] + wh / 2, 0);
      tmp.o.scale.set(1, Math.max(0.001, wh), 1);
      tmp.o.updateMatrix();
      wicks.current?.setMatrixAt(i, tmp.o.matrix);
      wicks.current?.setColorAt(i, tmp.c);
    }
    for (const m of [bodies.current, wicks.current]) {
      if (!m) continue;
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={bodies} args={[undefined, undefined, N]} frustumCulled={false}>
        <boxGeometry args={[0.32, 1, 0.32]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={wicks} args={[undefined, undefined, N]} frustumCulled={false}>
        <boxGeometry args={[0.05, 1, 0.05]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.7} />
      </instancedMesh>
    </>
  );
}

/** Média móvel em âmbar, desenhada até o candle atual. */
function MovingAverage({ series }: { series: ReturnType<typeof buildSeries> }) {
  const mesh = useRef<Mesh>(null);
  const geometry = useMemo(() => {
    const curve = new CatmullRomCurve3(series.ma.map((p) => p.clone().setZ(0.4)));
    return new TubeGeometry(curve, N * 3, 0.035, 6, false);
  }, [series]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(() => {
    const total = geometry.index?.count ?? 0;
    const f = Math.min(1, (frontierFor(journey.smooth) + 1) / N);
    // Cada segmento do tubo usa radialSegments*6 índices.
    const per = 6 * 6;
    geometry.setDrawRange(0, Math.floor((total / per) * f) * per);
  });
  return (
    <mesh ref={mesh} geometry={geometry}>
      <meshBasicMaterial color={AMBER.clone().multiplyScalar(2)} toneMapped={false} />
    </mesh>
  );
}

function makeTag(label: string, sub: string) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(5,6,8,0.85)";
  g.fillRect(0, 0, 1024, 256);
  g.strokeStyle = "#ffb000";
  g.lineWidth = 6;
  g.strokeRect(3, 3, 1018, 250);
  g.fillStyle = "#ffb000";
  g.font = "700 96px monospace";
  g.fillText(label, 44, 128);
  g.fillStyle = "#00e08a";
  g.font = "500 64px monospace";
  g.fillText(`▲ ${sub}`, 44, 212);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Marcos da carreira: feixe de luz sobre o candle de rompimento e a etiqueta da empresa. */
function Milestones({ series }: { series: ReturnType<typeof buildSeries> }) {
  const tags = useMemo(() => MILESTONES.map((m) => makeTag(m.label, m.sub)), []);
  useEffect(() => () => tags.forEach((t) => t.dispose()), [tags]);
  const groups = useRef<(Group | null)[]>([]);
  useFrame(({ clock }) => {
    const frontier = frontierFor(journey.smooth);
    MILESTONES.forEach((m, i) => {
      const g = groups.current[i];
      if (!g) return;
      const on = Math.min(1, Math.max(0, frontier - m.index + 1));
      const s = on * (journey.reduced ? 1 : 1 + Math.sin(clock.elapsedTime * 2 + i) * 0.02);
      g.scale.setScalar(Math.max(0.0001, s));
    });
  });
  return (
    <>
      {MILESTONES.map((m, i) => {
        const top = series.high[m.index];
        return (
          <group
            key={m.label}
            ref={(el) => {
              groups.current[i] = el;
            }}
            position={[xAt(m.index), top, 0]}
          >
            <group position={[0, 1.4, 0]}>
              <mesh position={[2.3, 0.9, 0.2]}>
                <planeGeometry args={[4, 1]} />
                <meshBasicMaterial map={tags[i]} transparent toneMapped={false} />
              </mesh>
            </group>
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 3, 8]} />
              <meshBasicMaterial color={AMBER.clone().multiplyScalar(2.5)} toneMapped={false} />
            </mesh>
            <mesh position={[0, 2.5, 0]}>
              <cylinderGeometry args={[0.4, 0.05, 5, 24, 1, true]} />
              <meshBasicMaterial color={AMBER} transparent opacity={0.08} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

function makeTicker(text: string) {
  const c = document.createElement("canvas");
  c.width = 4096;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#050608";
  g.fillRect(0, 0, 4096, 128);
  g.font = "600 64px monospace";
  let x = 20;
  for (const chunk of text.split("|")) {
    const up = !chunk.includes("-");
    g.fillStyle = up ? "#00e08a" : "#ff4561";
    g.fillText(chunk, x, 88);
    x += g.measureText(chunk).width + 80;
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = RepeatWrapping;
  return t;
}

/** Painel de cotações rolando ao fundo, com a stack como "ativos". */
function Ticker() {
  const texture = useMemo<Texture>(
    () =>
      makeTicker(
        "NET10 ▲ 9.6%|AWS ▲ 8.2%|K8S ▲ 7.9%|RABBITMQ ▲ 8.8%|LEGACY ▼ -3.1%|PGSQL ▲ 6.4%|REACT ▲ 7.8%|DOWNTIME ▼ -9.9%|DATADOG ▲ 7.5%|AI-DLC ▲ 7.2%|POLLING ▼ -4.0%",
      ),
    [],
  );
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame((_, delta) => {
    if (!journey.reduced) texture.offset.x += Math.min(delta, 0.1) * (0.02 + journey.impulse * 0.1);
  });
  return (
    <mesh position={[0, 17, -36]}>
      <planeGeometry args={[150, 4.4]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

/** Livro de ofertas da stack: compras (verde) à esquerda, vendas (vermelho) à direita, em degraus. */
function OrderBook({ x, y }: { x: number; y: number }) {
  const { skills } = useContent();
  const bars = useRef<(Group | null)[]>([]);
  useFrame(({ clock }) => {
    const here = Math.max(0, 1 - Math.abs(journey.smooth - 6.4) * 1.1);
    bars.current.forEach((b, i) => {
      if (!b) return;
      const wobble = journey.reduced ? 0 : Math.sin(clock.elapsedTime * 2.4 + i * 1.7) * 0.05;
      b.scale.y = Math.max(0.001, here * (1 + wobble));
    });
  });
  const levels = skills.length;
  return (
    <group position={[x, y, 0]}>
      {Array.from({ length: levels * 2 }, (_, k) => {
        const bid = k < levels;
        const j = bid ? levels - 1 - k : k - levels;
        const depth = (skills[j].value / 100) * 3.6 * (1 + j * 0.12);
        const px = bid ? -0.6 - j * 0.62 : 0.6 + j * 0.62;
        return (
          <group
            key={k}
            ref={(el) => {
              bars.current[k] = el;
            }}
            position={[px, 0, 0]}
          >
            <mesh position={[0, depth / 2, 0]}>
              <boxGeometry args={[0.55, depth, 1.6]} />
              <meshStandardMaterial
                color={bid ? "#003b24" : "#3b0a12"}
                emissive={bid ? UP : DOWN}
                emissiveIntensity={0.55 + (levels - j) * 0.08}
                roughness={0.4}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>
        );
      })}
      {/* O spread: a linha entre a melhor compra e a melhor venda. */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[0.04, 8, 0.04]} />
        <meshBasicMaterial color={AMBER.clone().multiplyScalar(3)} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Partículas subindo como negócios fechando. */
function Trades() {
  const ref = useRef<InstancedMesh>(null);
  const COUNT = 220;
  const state = useMemo(() => {
    let seed = 21;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: COUNT }, () => ({ x: (r() - 0.5) * 100, y: r() * 20, z: -6 - r() * 14, v: 0.3 + r() * 0.8, up: r() > 0.35 }));
  }, []);
  const tmp = useMemo(() => ({ o: new Object3D(), c: new Color() }), []);
  useEffect(() => {
    state.forEach((p, i) => ref.current?.setColorAt(i, tmp.c.copy(p.up ? UP : DOWN).multiplyScalar(1.6)));
    if (ref.current?.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [state, tmp]);
  useFrame((_, delta) => {
    const dt = journey.reduced ? 0 : Math.min(delta, 0.1);
    state.forEach((p, i) => {
      p.y += dt * p.v * (p.up ? 1 : -1) * (1 + journey.impulse * 3);
      if (p.y > 20) p.y = 0;
      if (p.y < 0) p.y = 20;
      tmp.o.position.set(p.x, p.y, p.z);
      tmp.o.updateMatrix();
      ref.current?.setMatrixAt(i, tmp.o.matrix);
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.05, 0.05, 0.05]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function Effects() {
  const bloom = useRef<BloomEffect>(null);
  useFrame(() => {
    if (bloom.current) bloom.current.intensity = 0.8 + journey.impulse * 1.2;
  });
  return (
    <EffectComposer multisampling={0}>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.8} radius={0.65} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Scanline density={1.4} opacity={0.07} blendFunction={BlendFunction.OVERLAY} />
      <Vignette darkness={0.65} offset={0.25} />
      <Noise opacity={0.04} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}

/** Mundo "Livro de ofertas": a carreira como um gráfico que se desenha enquanto você rola. */
export default function MercadoScene(props: WorldSceneProps) {
  const series = useMemo(() => buildSeries(), []);
  const book = { x: xAt(N - 1) + 9, y: 0 };

  const keys = useMemo<CameraKey[]>(() => {
    const at = (i: number): CameraKey => {
      const x = xAt(i);
      const y = series.close[i];
      return { pos: [x + 3.2, y + 2.4, 10], look: [x - 0.8, y + 1.6, 0] };
    };
    return [
      { pos: [10, 11, 44], look: [-4, 6.5, -2] },
      ...MILESTONES.map((m) => at(m.index)),
      { pos: [book.x + 1, 7, 17], look: [book.x - 4.5, 2.4, 0] },
      { pos: [book.x + 5, 3.5, 13], look: [book.x - 2.5, 2.2, 0] },
    ];
  }, [series, book.x]);

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
      <fog attach="fog" args={[BG, 24, 90]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} />
      <CameraRig keys={keys} parallax={[0.9, 0.5]} />
      <gridHelper args={[200, 200, "#1d2a24", "#0f1714"]} position={[0, -0.01, 0]} />
      <Candles series={series} />
      <MovingAverage series={series} />
      <Milestones series={series} />
      <Ticker />
      <Trades />
      <OrderBook x={book.x} y={0} />
      {!props.device.low && <Effects />}
    </WorldCanvas>
  );
}

/** O pico do clique decai sozinho (mesmo sem efeitos em aparelho modesto). */
function ImpulseDecay() {
  useFrame((_, delta) => {
    journey.impulse = Math.max(0, journey.impulse - Math.min(delta, 0.1) * 1.3);
  });
  return null;
}
