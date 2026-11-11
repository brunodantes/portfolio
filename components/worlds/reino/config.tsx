import dynamic from "next/dynamic";
import { Cinzel, EB_Garamond } from "next/font/google";
import type { WorldConfig } from "../engine/types";
import { REINO_ALIGN, REINO_MINIMAP } from "./layout";

const display = Cinzel({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--w-display" });
const serif = EB_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--w-sans" });

const Scene = dynamic(() => import("./ReinoScene"), { ssr: false });

const GOLD = "#d4a54a";

/** Reino: noite medieval, pedra, ouro e carmesim; tipografia de inscrição. */
export const reino: WorldConfig = {
  className: `${display.variable} ${serif.variable} bg-[#070a17] text-[#e9dfc8] font-[family-name:var(--w-sans)]`,
  scene: Scene,
  align: REINO_ALIGN,
  cardMotion: true,
  fallback: <div className="absolute inset-0 bg-[linear-gradient(180deg,#05070f,#1b2240_60%,#b0603a)]" />,
  game: {
    minimap: REINO_MINIMAP,
    accent: GOLD,
    panel: "border border-[#d4a54a]/30 bg-[#0d0b10]/80 text-[#e9dfc8] backdrop-blur-md",
  },
  skin: {
    panel:
      "relative border border-[#d4a54a]/45 bg-[#100d0b]/85 p-7 shadow-[0_0_0_4px_rgb(16_13_11/0.85),0_0_0_5px_rgb(212_165_74/0.25),0_40px_90px_-30px_rgb(0_0_0/0.95)] backdrop-blur-md before:absolute before:top-2 before:left-2 before:size-3 before:border-t before:border-l before:border-[#d4a54a] after:absolute after:right-2 after:bottom-2 after:size-3 after:border-r after:border-b after:border-[#d4a54a]",
    kicker: "font-[family-name:var(--w-display)] text-[12px] font-semibold tracking-[0.18em] text-[#d4a54a]",
    title: "font-[family-name:var(--w-display)] text-[30px] font-semibold leading-tight text-[#f4ead2]",
    hero: "font-[family-name:var(--w-display)] text-[38px] font-bold leading-[1.08] text-[#f4ead2] sm:text-[46px]",
    sub: "text-[15px] italic text-[#b9a985]",
    body: "text-[18px] leading-relaxed text-[#ddd1b6]",
    bullet: "text-[16.5px] leading-snug text-[#e9dfc8]",
    marker: "",
    markerChar: "",
    check: "text-[#d4a54a]",
    tag: "border border-[#d4a54a]/25 bg-[#1a1511] px-2 py-0.5 text-[14px] text-[#d9c9a3]",
    badge: "border border-[#8b1e2d]/70 bg-[#8b1e2d]/25 px-2 py-0.5 text-[14.5px] text-[#f0d9b0]",
    link: "font-[family-name:var(--w-display)] text-[12px] font-semibold tracking-wider text-[#d4a54a] underline-offset-4 hover:underline cursor-pointer",
    button:
      "border border-[#d4a54a] bg-[#8b1e2d] px-5 py-2.5 font-[family-name:var(--w-display)] text-[14px] font-semibold tracking-wider text-[#f4ead2] hover:bg-[#a52a3b]",
    barTrack: "bg-[#2a221a]",
    barFill: "bg-[linear-gradient(90deg,#8b6a2a,#d4a54a)]",
    divider: "border-t border-[#d4a54a]/20",
  },
  hud: {
    bar: "bg-gradient-to-b from-[#070a17]/95 to-transparent font-[family-name:var(--w-display)] text-[12px] tracking-wider",
    brand: "font-[family-name:var(--w-display)] text-[17px] font-semibold tracking-[0.12em] text-[#f4ead2]",
    item: "text-[#b9a985] hover:text-[#f4ead2]",
    itemActive: "text-[#d4a54a]",
    button: "border border-[#d4a54a]/60 px-3 py-1 text-[#d4a54a] hover:bg-[#d4a54a] hover:text-[#100d0b]",
  },
};
