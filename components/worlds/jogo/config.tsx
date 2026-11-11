import dynamic from "next/dynamic";
import { Bungee, Nunito, Press_Start_2P } from "next/font/google";
import type { WorldConfig } from "../engine/types";

const display = Bungee({ subsets: ["latin"], weight: "400", variable: "--w-display" });
const pixel = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--w-mono" });
const sans = Nunito({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--w-sans" });

const Scene = dynamic(() => import("./JogoScene"), { ssr: false });

/** Mundo do jogo: entardecer roxo e laranja, ilhas verde-menta, ouro das moedas. */
export const jogo: WorldConfig = {
  className: `${display.variable} ${pixel.variable} ${sans.variable} bg-[#140c33] text-[#f4ecff] font-[family-name:var(--w-sans)]`,
  scene: Scene,
  align: ["left", "left", "left", "left", "left", "left", "left", "left"],
  fallback: <div className="absolute inset-0 bg-[linear-gradient(180deg,#140c33,#5b2a86_60%,#ff8a5c)]" />,
  skin: {
    panel:
      "rounded-2xl border-4 border-[#140c33] bg-[#fff8ec] p-6 text-[#2a1650] shadow-[6px_6px_0_0_#140c33,0_30px_60px_-20px_rgb(0_0_0/0.6)]",
    kicker: "font-[family-name:var(--w-mono)] text-[10px] leading-relaxed text-[#ff6b6b]",
    title: "font-[family-name:var(--w-display)] text-[28px] leading-tight text-[#2a1650]",
    hero: "font-[family-name:var(--w-display)] text-[36px] leading-[1.05] text-[#2a1650] sm:text-[44px]",
    sub: "text-[13px] font-semibold text-[#7a5ea8]",
    body: "text-[16px] leading-relaxed text-[#3d2a63]",
    bullet: "text-[15px] leading-relaxed text-[#2a1650]",
    marker: "pt-[1px] text-[14px] text-[#e0a800]",
    markerChar: "★",
    tag: "rounded-full border-2 border-[#2a1650] bg-[#5ee3a1] px-2.5 py-0.5 text-[12px] font-extrabold text-[#2a1650]",
    link: "text-[13px] font-extrabold text-[#7c5cff] underline decoration-2 underline-offset-4 cursor-pointer",
    button:
      "rounded-xl border-4 border-[#140c33] bg-[#ffd23f] px-4 py-2 font-[family-name:var(--w-display)] text-[16px] text-[#140c33] shadow-[4px_4px_0_0_#140c33] hover:translate-y-[-2px] hover:shadow-[4px_6px_0_0_#140c33]",
    barTrack: "rounded-full bg-[#e7dcff] ring-2 ring-[#2a1650]",
    barFill: "rounded-full bg-[linear-gradient(90deg,#5ee3a1,#38e1ff)]",
    divider: "border-t-2 border-dashed border-[#2a1650]/20",
  },
  hud: {
    bar: "font-[family-name:var(--w-mono)] text-[10px]",
    brand: "font-[family-name:var(--w-display)] text-[18px] text-[#ffd23f] [text-shadow:3px_3px_0_#140c33]",
    item: "text-[#d8c9ff] hover:text-white",
    itemActive: "text-[#ffd23f]",
    button: "rounded-lg border-2 border-[#140c33] bg-[#ffd23f] px-3 py-1.5 text-[#140c33] shadow-[3px_3px_0_0_#140c33]",
  },
};
