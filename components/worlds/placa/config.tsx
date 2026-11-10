import dynamic from "next/dynamic";
import { Chakra_Petch, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import type { WorldConfig } from "../engine/types";

const display = Chakra_Petch({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--w-display" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500"], variable: "--w-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--w-mono" });

const Scene = dynamic(() => import("./PlacaScene"), { ssr: false });

/** Placa de circuito: máscara de solda verde, cobre e ouro, serigrafia branca. */
export const placa: WorldConfig = {
  className: `${display.variable} ${sans.variable} ${mono.variable} bg-[#03140f] text-[#d7e6de] font-[family-name:var(--w-sans)]`,
  scene: Scene,
  align: ["left", "left", "left", "left", "left", "left", "left", "left"],
  fallback: <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,#0f4a39,#03140f_70%)]" />,
  skin: {
    panel:
      "relative border border-[#e0a84a]/35 bg-[#03140f]/80 p-6 backdrop-blur-md shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] before:absolute before:-top-px before:-left-px before:size-3 before:border-t-2 before:border-l-2 before:border-[#ffcf73] after:absolute after:-right-px after:-bottom-px after:size-3 after:border-r-2 after:border-b-2 after:border-[#ffcf73]",
    kicker: "font-[family-name:var(--w-mono)] text-[12px] tracking-wide text-[#ffcf73]",
    title: "font-[family-name:var(--w-display)] text-[30px] font-semibold leading-tight text-[#f2f6f3]",
    hero: "font-[family-name:var(--w-display)] text-[40px] font-bold leading-[1.02] text-[#f2f6f3] sm:text-[52px]",
    sub: "font-[family-name:var(--w-mono)] text-[12.5px] text-[#8fb3a3]",
    body: "text-[16px] leading-relaxed text-[#c3d6cc]",
    bullet: "text-[14.5px] leading-relaxed text-[#d7e6de]",
    marker: "pt-[3px] font-[family-name:var(--w-mono)] text-[11px] text-[#ffcf73]",
    markerChar: "◆",
    tag: "border border-[#e0a84a]/30 bg-[#0a3328]/70 px-2 py-1 font-[family-name:var(--w-mono)] text-[11px] text-[#e6d3a8]",
    link: "font-[family-name:var(--w-mono)] text-[12px] text-[#9ff6ff] underline-offset-4 hover:underline cursor-pointer",
    button:
      "bg-[#ffcf73] px-4 py-2.5 font-[family-name:var(--w-display)] text-[15px] font-semibold text-[#03140f] hover:bg-[#ffe2a6]",
    barTrack: "bg-[#0a3328]",
    barFill: "bg-[linear-gradient(90deg,#b9853a,#ffcf73)]",
    divider: "border-t border-[#e0a84a]/20",
  },
  hud: {
    bar: "bg-gradient-to-b from-[#03140f]/90 to-transparent font-[family-name:var(--w-mono)] text-[12px]",
    brand: "font-[family-name:var(--w-display)] text-[15px] font-semibold tracking-wide text-[#f2f6f3]",
    item: "text-[#8fb3a3] hover:text-[#f2f6f3]",
    itemActive: "text-[#ffcf73]",
    button: "border border-[#ffcf73]/60 px-3 py-1 text-[#ffcf73] hover:bg-[#ffcf73] hover:text-[#03140f]",
  },
};
