import dynamic from "next/dynamic";
import { Barlow, Barlow_Condensed, Fira_Code } from "next/font/google";
import type { WorldConfig } from "../engine/types";

const display = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--w-display" });
const sans = Barlow({ subsets: ["latin"], weight: ["400", "500"], variable: "--w-sans" });
const mono = Fira_Code({ subsets: ["latin"], weight: ["400", "500"], variable: "--w-mono" });

const Scene = dynamic(() => import("./DatacenterScene"), { ssr: false });

/** Sala de controle: azul frio de LED, metal escuro, sinalização industrial. */
export const datacenter: WorldConfig = {
  className: `${display.variable} ${sans.variable} ${mono.variable} bg-[#03060b] text-[#d6e4f2] font-[family-name:var(--w-sans)]`,
  scene: Scene,
  // O rack fica de um lado da tela e o texto do outro.
  align: ["left", "right", "left", "right", "left", "right", "left", "left"],
  fallback: <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#10243a,#03060b_70%)]" />,
  skin: {
    panel:
      "rounded-[3px] border border-[#7cc7ff]/25 bg-[#060b12]/80 p-6 backdrop-blur-md shadow-[0_0_0_1px_rgb(124_199_255/0.06),0_30px_80px_-20px_rgb(0_0_0/0.9)]",
    kicker: "font-[family-name:var(--w-mono)] text-[11.5px] text-[#4dff9a]",
    title: "font-[family-name:var(--w-display)] text-[34px] font-semibold uppercase leading-none tracking-wide text-[#f2f8ff]",
    hero: "font-[family-name:var(--w-display)] text-[48px] font-bold uppercase leading-[0.95] tracking-wide text-[#f2f8ff] sm:text-[62px]",
    sub: "font-[family-name:var(--w-mono)] text-[11.5px] text-[#7f97b0]",
    body: "text-[16px] leading-relaxed text-[#b8c9da]",
    bullet: "text-[15px] leading-relaxed text-[#d6e4f2]",
    marker: "pt-[7px]",
    markerChar: "▪",
    tag: "rounded-[2px] bg-[#0d1a28] px-2 py-1 font-[family-name:var(--w-mono)] text-[11px] text-[#7cc7ff]",
    link: "font-[family-name:var(--w-mono)] text-[12px] text-[#4dff9a] underline-offset-4 hover:underline cursor-pointer",
    button:
      "rounded-[3px] bg-[#7cc7ff] px-4 py-2.5 font-[family-name:var(--w-display)] text-[17px] font-semibold uppercase tracking-wide text-[#03060b] hover:bg-[#b5e0ff]",
    barTrack: "bg-[#0d1a28]",
    barFill: "bg-[#4dff9a] shadow-[0_0_10px_#4dff9a]",
    divider: "border-t border-[#7cc7ff]/15",
  },
  hud: {
    bar: "bg-gradient-to-b from-[#03060b]/95 to-transparent font-[family-name:var(--w-mono)] text-[12px]",
    brand: "font-[family-name:var(--w-display)] text-[18px] font-semibold uppercase tracking-wider text-[#f2f8ff]",
    item: "text-[#7f97b0] hover:text-[#f2f8ff]",
    itemActive: "text-[#4dff9a]",
    button: "rounded-[2px] border border-[#7cc7ff]/50 px-3 py-1 text-[#7cc7ff] hover:bg-[#7cc7ff] hover:text-[#03060b]",
  },
};
