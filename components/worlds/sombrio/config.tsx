import dynamic from "next/dynamic";
import { Cormorant_Garamond, Cormorant_SC } from "next/font/google";
import type { WorldConfig } from "../engine/types";
import { SOMBRIO_ALIGN, SOMBRIO_MINIMAP } from "./layout";

const display = Cormorant_SC({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--w-display" });
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--w-sans" });

const Scene = dynamic(() => import("./SombrioScene"), { ssr: false });

const GOLD = "#e8c26a";

/** Terras sombrias: cinza de cinzas, ouro pálido, interface mínima com filetes finos. */
export const sombrio: WorldConfig = {
  className: `${display.variable} ${serif.variable} bg-[#16140f] text-[#e6dcc6] font-[family-name:var(--w-sans)]`,
  scene: Scene,
  align: SOMBRIO_ALIGN,
  cardMotion: true,
  fallback: <div className="absolute inset-0 bg-[linear-gradient(180deg,#1b1a17,#4d473b_60%,#c9a25a)]" />,
  game: {
    minimap: SOMBRIO_MINIMAP,
    accent: GOLD,
    panel: "border-y border-[#e8c26a]/25 bg-black/55 text-[#e6dcc6] backdrop-blur-sm",
  },
  skin: {
    panel:
      "relative bg-[linear-gradient(90deg,rgb(0_0_0/0.82),rgb(0_0_0/0.6))] px-7 py-6 backdrop-blur-sm before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,#e8c26a,transparent)] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[linear-gradient(90deg,transparent,#e8c26a80,transparent)]",
    kicker: "font-[family-name:var(--w-display)] text-[14px] font-semibold tracking-[0.2em] text-[#e8c26a]",
    title: "font-[family-name:var(--w-display)] text-[34px] font-semibold leading-tight tracking-wide text-[#f3ead6]",
    hero: "font-[family-name:var(--w-display)] text-[44px] font-semibold leading-[1.02] tracking-wide text-[#f3ead6] sm:text-[54px]",
    sub: "text-[16px] italic text-[#b5a98c]",
    body: "text-[19px] leading-relaxed text-[#d9cfb8]",
    bullet: "text-[17.5px] font-medium leading-snug text-[#e6dcc6]",
    marker: "",
    markerChar: "",
    check: "text-[#e8c26a]",
    tag: "border-b border-[#e8c26a]/30 px-1 py-0.5 text-[15px] text-[#cfc3a6]",
    badge: "bg-[#e8c26a]/10 px-2 py-0.5 text-[15.5px] text-[#f0dca8] ring-1 ring-[#e8c26a]/35",
    link: "font-[family-name:var(--w-display)] text-[14px] font-semibold tracking-[0.12em] text-[#e8c26a] underline-offset-4 hover:underline cursor-pointer",
    button:
      "border border-[#e8c26a]/70 bg-black/40 px-6 py-2.5 font-[family-name:var(--w-display)] text-[16px] font-semibold tracking-[0.18em] text-[#f3ead6] hover:bg-[#e8c26a] hover:text-[#16140f]",
    barTrack: "bg-white/10",
    barFill: "bg-[linear-gradient(90deg,#8a6d33,#e8c26a)]",
    divider: "border-t border-[#e8c26a]/15",
  },
  hud: {
    bar: "bg-gradient-to-b from-black/70 to-transparent font-[family-name:var(--w-display)] text-[14px] tracking-[0.12em]",
    brand: "font-[family-name:var(--w-display)] text-[19px] font-semibold tracking-[0.2em] text-[#f3ead6]",
    item: "text-[#b5a98c] hover:text-[#f3ead6]",
    itemActive: "text-[#e8c26a]",
    button: "border border-[#e8c26a]/50 px-3 py-0.5 text-[#e8c26a] hover:bg-[#e8c26a] hover:text-[#16140f]",
  },
};
