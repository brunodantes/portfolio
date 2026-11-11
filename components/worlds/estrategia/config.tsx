import dynamic from "next/dynamic";
import { IBM_Plex_Mono, IBM_Plex_Sans, Rajdhani } from "next/font/google";
import type { WorldConfig } from "../engine/types";
import { ESTRATEGIA_MINIMAP } from "./layout";

const display = Rajdhani({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--w-display" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"], variable: "--w-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--w-mono" });

const Scene = dynamic(() => import("./EstrategiaScene"), { ssr: false });

const ACCENT = "#3be87f";

/** Estratégia: noite azul-ardósia, pedra e musgo, um só destaque (verde fósforo), HUD de RPG sóbrio. */
export const estrategia: WorldConfig = {
  className: `${display.variable} ${sans.variable} ${mono.variable} bg-[#070b14] text-[#dbe4ef] font-[family-name:var(--w-sans)]`,
  scene: Scene,
  align: ["left", "left", "left", "left", "left", "left", "left", "left"],
  fallback: <div className="absolute inset-0 bg-[linear-gradient(180deg,#03060b,#0f1d30_60%,#1d4652)]" />,
  game: {
    minimap: ESTRATEGIA_MINIMAP,
    accent: ACCENT,
    panel: "rounded-[4px] border border-white/10 bg-[#070b14]/75 text-[#dbe4ef] backdrop-blur-md",
  },
  skin: {
    panel:
      "relative rounded-[4px] border border-white/10 bg-[#0a111d]/80 p-6 backdrop-blur-md shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] before:absolute before:inset-x-6 before:-top-px before:h-px before:bg-[linear-gradient(90deg,transparent,#3be87f,transparent)]",
    kicker: "font-[family-name:var(--w-mono)] text-[11.5px] tracking-wide text-[#3be87f]",
    title: "font-[family-name:var(--w-display)] text-[34px] font-semibold uppercase leading-none tracking-wide text-[#f2f6fb]",
    hero: "font-[family-name:var(--w-display)] text-[46px] font-bold uppercase leading-[0.95] tracking-wide text-[#f2f6fb] sm:text-[58px]",
    sub: "font-[family-name:var(--w-mono)] text-[11.5px] text-[#8193a8]",
    body: "text-[15.5px] leading-relaxed text-[#b9c6d6]",
    bullet: "text-[14.5px] leading-relaxed text-[#dbe4ef]",
    marker: "",
    markerChar: "",
    check: "text-[#3be87f]",
    tag: "rounded-[3px] bg-white/5 px-2 py-1 font-[family-name:var(--w-mono)] text-[11px] text-[#b9c6d6] ring-1 ring-white/10",
    badge: "rounded-[3px] bg-[#3be87f]/10 px-2 py-1 text-[12.5px] text-[#b4ffcd] ring-1 ring-[#3be87f]/30",
    link: "font-[family-name:var(--w-mono)] text-[12px] text-[#3be87f] underline-offset-4 hover:underline cursor-pointer",
    button:
      "rounded-[3px] bg-[#3be87f] px-4 py-2.5 font-[family-name:var(--w-display)] text-[17px] font-semibold uppercase tracking-wide text-[#05100a] hover:bg-[#7ff5ad]",
    barTrack: "rounded-full bg-white/10",
    barFill: "rounded-full bg-[#3be87f]",
    divider: "border-t border-white/10",
  },
  hud: {
    bar: "bg-gradient-to-b from-[#070b14]/95 to-transparent font-[family-name:var(--w-mono)] text-[12px]",
    brand: "font-[family-name:var(--w-display)] text-[19px] font-semibold uppercase tracking-wider text-[#f2f6fb]",
    item: "text-[#8193a8] hover:text-[#f2f6fb]",
    itemActive: "text-[#3be87f]",
    button: "rounded-[3px] border border-[#3be87f]/50 px-3 py-1 text-[#3be87f] hover:bg-[#3be87f] hover:text-[#05100a]",
  },
};
