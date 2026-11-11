import dynamic from "next/dynamic";
import type { WorldConfig } from "../types";
import { OPS, TATICO_MINIMAP } from "./layout";


const Scene = dynamic(() => import("./TaticoScene"), { ssr: false });

/** Cor do HUD de missão (o mesmo `--p-accent` de app/globals.css). */
const ACCENT = "#4cc9f0";

/** Tema oficial: holograma ciano sobre mesa escura, âmbar para a unidade, a rota e as ações. */
export const tatico: WorldConfig = {
  className: "bg-bg text-body font-sans",
  scene: Scene,
  align: ["left", "left", "left", "left", "left", "left", "left", "left"],
  fallback: <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_60%,#0b2a3a,#03060c_70%)]" />,
  game: {
    minimap: TATICO_MINIMAP,
    codes: ["BRF", ...OPS.map((o) => o.code)],
    accent: ACCENT,
    panel: "border border-accent/25 bg-bg/80 text-body backdrop-blur-md",
  },
  skin: {
    panel:
      "relative border border-accent/25 bg-surface/80 p-6 backdrop-blur-md [clip-path:polygon(0_0,calc(100%-18px)_0,100%_18px,100%_100%,18px_100%,0_calc(100%-18px))]",
    kicker: "font-mono text-[12.5px] tracking-wide text-signal",
    title: "font-display text-[30px] font-semibold uppercase leading-tight tracking-wide text-title",
    hero: "font-display text-[40px] font-bold uppercase leading-[1] tracking-wide text-title sm:text-[50px]",
    sub: "font-mono text-[12.5px] text-muted",
    body: "text-[15.5px] leading-relaxed text-soft",
    bullet: "text-[14.5px] leading-relaxed text-body",
    marker: "",
    markerChar: "",
    check: "text-accent",
    tag: "border border-accent/25 px-2 py-1 font-mono text-[12px] text-accent-text",
    badge: "border border-signal/40 bg-signal/10 px-2 py-1 text-[12.5px] text-signal-text",
    link: "font-mono text-[12.5px] text-accent underline-offset-4 hover:underline cursor-pointer",
    button:
      "bg-signal px-4 py-2.5 font-display text-[15px] font-semibold uppercase tracking-wide text-on-signal hover:bg-signal-hover",
    barTrack: "bg-accent/10",
    barFill: "bg-accent shadow-[0_0_10px_var(--p-accent)]",
    divider: "border-t border-accent/15",
  },
  hud: {
    bar: "bg-gradient-to-b from-bg/95 to-transparent font-mono text-[13px]",
    brand: "font-display text-[17px] font-semibold uppercase tracking-widest text-title",
    item: "text-muted hover:text-title",
    itemActive: "text-accent",
    button: "border border-signal/60 px-3 py-1 text-signal hover:bg-signal hover:text-on-signal",
  },
};
