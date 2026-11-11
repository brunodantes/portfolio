import dynamic from "next/dynamic";
import { IBM_Plex_Sans, Oxanium, Share_Tech_Mono } from "next/font/google";
import type { WorldConfig } from "../engine/types";
import { TATICO_MINIMAP } from "./layout";

const display = Oxanium({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--w-display" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"], variable: "--w-sans" });
const mono = Share_Tech_Mono({ subsets: ["latin"], weight: "400", variable: "--w-mono" });

const Scene = dynamic(() => import("./TaticoScene"), { ssr: false });

const ACCENT = "#4cc9f0";

/** Sala tática: holograma ciano sobre mesa escura, âmbar para a unidade e a rota. */
export const tatico: WorldConfig = {
  className: `${display.variable} ${sans.variable} ${mono.variable} bg-[#03060c] text-[#d6ecf7] font-[family-name:var(--w-sans)]`,
  scene: Scene,
  align: ["left", "left", "left", "left", "left", "left", "left", "left"],
  fallback: <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_60%,#0b2a3a,#03060c_70%)]" />,
  game: {
    minimap: TATICO_MINIMAP,
    accent: ACCENT,
    panel: "border border-[#4cc9f0]/25 bg-[#03060c]/80 text-[#d6ecf7] backdrop-blur-md",
  },
  skin: {
    panel:
      "relative border border-[#4cc9f0]/25 bg-[#040a14]/80 p-6 backdrop-blur-md [clip-path:polygon(0_0,calc(100%-18px)_0,100%_18px,100%_100%,18px_100%,0_calc(100%-18px))]",
    kicker: "font-[family-name:var(--w-mono)] text-[12.5px] tracking-wide text-[#ffb347]",
    title: "font-[family-name:var(--w-display)] text-[30px] font-semibold uppercase leading-tight tracking-wide text-[#f0fbff]",
    hero: "font-[family-name:var(--w-display)] text-[40px] font-bold uppercase leading-[1] tracking-wide text-[#f0fbff] sm:text-[50px]",
    sub: "font-[family-name:var(--w-mono)] text-[12.5px] text-[#7fa6b8]",
    body: "text-[15.5px] leading-relaxed text-[#b5d0dd]",
    bullet: "text-[14.5px] leading-relaxed text-[#d6ecf7]",
    marker: "",
    markerChar: "",
    check: "text-[#4cc9f0]",
    tag: "border border-[#4cc9f0]/25 px-2 py-1 font-[family-name:var(--w-mono)] text-[12px] text-[#9fdcf2]",
    badge: "border border-[#ffb347]/40 bg-[#ffb347]/10 px-2 py-1 text-[12.5px] text-[#ffd59a]",
    link: "font-[family-name:var(--w-mono)] text-[12.5px] text-[#4cc9f0] underline-offset-4 hover:underline cursor-pointer",
    button:
      "bg-[#ffb347] px-4 py-2.5 font-[family-name:var(--w-display)] text-[15px] font-semibold uppercase tracking-wide text-[#120a00] hover:bg-[#ffd08a]",
    barTrack: "bg-[#4cc9f0]/10",
    barFill: "bg-[#4cc9f0] shadow-[0_0_10px_#4cc9f0]",
    divider: "border-t border-[#4cc9f0]/15",
  },
  hud: {
    bar: "bg-gradient-to-b from-[#03060c]/95 to-transparent font-[family-name:var(--w-mono)] text-[13px]",
    brand: "font-[family-name:var(--w-display)] text-[17px] font-semibold uppercase tracking-widest text-[#f0fbff]",
    item: "text-[#7fa6b8] hover:text-[#f0fbff]",
    itemActive: "text-[#4cc9f0]",
    button: "border border-[#ffb347]/60 px-3 py-1 text-[#ffb347] hover:bg-[#ffb347] hover:text-[#120a00]",
  },
};
