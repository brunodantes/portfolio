import dynamic from "next/dynamic";
import { Exo_2, Manrope, Space_Mono } from "next/font/google";
import type { WorldConfig } from "../engine/types";
import { ORBITAL_MINIMAP } from "./layout";

const display = Exo_2({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--w-display" });
const sans = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--w-sans" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--w-mono" });

const Scene = dynamic(() => import("./OrbitalScene"), { ssr: false });

const ACCENT = "#5ef2d6";

/** Mapa orbital: espaço profundo, estrela âmbar, interface em verde-água. */
export const orbital: WorldConfig = {
  className: `${display.variable} ${sans.variable} ${mono.variable} bg-[#03040a] text-[#dfe7f2] font-[family-name:var(--w-sans)]`,
  scene: Scene,
  align: ["left", "left", "left", "left", "left", "left", "left", "left"],
  fallback: <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,#3a2a10,#03040a_45%)]" />,
  game: {
    minimap: ORBITAL_MINIMAP,
    accent: ACCENT,
    panel: "rounded-md border border-white/10 bg-[#03040a]/75 text-[#dfe7f2] backdrop-blur-md",
  },
  skin: {
    panel: "rounded-lg border border-white/10 bg-[#070a14]/75 p-6 backdrop-blur-xl shadow-[0_0_60px_-20px_rgb(94_242_214/0.25)]",
    kicker: "font-[family-name:var(--w-mono)] text-[11.5px] tracking-wide text-[#5ef2d6]",
    title: "font-[family-name:var(--w-display)] text-[32px] font-semibold leading-tight text-[#f4f8ff]",
    hero: "font-[family-name:var(--w-display)] text-[42px] font-bold leading-[1.02] text-[#f4f8ff] sm:text-[54px]",
    sub: "font-[family-name:var(--w-mono)] text-[11.5px] text-[#8a97ad]",
    body: "text-[15.5px] leading-relaxed text-[#b9c4d6]",
    bullet: "text-[14.5px] leading-relaxed text-[#dfe7f2]",
    marker: "",
    markerChar: "",
    check: "text-[#5ef2d6]",
    tag: "rounded-full bg-white/5 px-2.5 py-1 font-[family-name:var(--w-mono)] text-[11px] text-[#b9c4d6] ring-1 ring-white/10",
    badge: "rounded-full bg-[#ffcf7a]/10 px-2.5 py-1 text-[12.5px] text-[#ffe2ad] ring-1 ring-[#ffcf7a]/30",
    link: "font-[family-name:var(--w-mono)] text-[12px] text-[#5ef2d6] underline-offset-4 hover:underline cursor-pointer",
    button:
      "rounded-full bg-[#5ef2d6] px-5 py-2.5 font-[family-name:var(--w-display)] text-[15px] font-semibold text-[#03140f] hover:bg-[#9ff8e7]",
    barTrack: "rounded-full bg-white/10",
    barFill: "rounded-full bg-[linear-gradient(90deg,#5ef2d6,#ffcf7a)]",
    divider: "border-t border-white/10",
  },
  hud: {
    bar: "bg-gradient-to-b from-[#03040a]/90 to-transparent font-[family-name:var(--w-mono)] text-[12px]",
    brand: "font-[family-name:var(--w-display)] text-[18px] font-semibold tracking-wide text-[#f4f8ff]",
    item: "text-[#8a97ad] hover:text-[#f4f8ff]",
    itemActive: "text-[#5ef2d6]",
    button: "rounded-full border border-[#5ef2d6]/50 px-3 py-1 text-[#5ef2d6] hover:bg-[#5ef2d6] hover:text-[#03140f]",
  },
};
