import dynamic from "next/dynamic";
import { Manrope, Martian_Mono } from "next/font/google";
import type { WorldConfig } from "../engine/types";

const mono = Martian_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--w-mono" });
const sans = Manrope({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--w-sans" });

const Scene = dynamic(() => import("./MercadoScene"), { ssr: false });

/** Livro de ofertas: terminal de trading, âmbar sobre preto, verde compra e vermelho venda. */
export const mercado: WorldConfig = {
  className: `${mono.variable} ${sans.variable} bg-[#050608] text-[#e9e4d8] font-[family-name:var(--w-sans)]`,
  scene: Scene,
  align: ["left", "left", "left", "left", "left", "left", "left", "left"],
  fallback: <div className="absolute inset-0 bg-[linear-gradient(160deg,#0b120e,#050608_60%)]" />,
  skin: {
    panel: "border-l-2 border-[#ffb000] bg-[#050608]/85 p-6 backdrop-blur-md",
    kicker: "font-[family-name:var(--w-mono)] text-[11px] uppercase tracking-[0.12em] text-[#ffb000]",
    title: "font-[family-name:var(--w-mono)] text-[26px] font-bold leading-tight text-[#f5f1e6]",
    hero: "font-[family-name:var(--w-mono)] text-[34px] font-bold leading-[1.08] text-[#f5f1e6] sm:text-[44px]",
    sub: "font-[family-name:var(--w-mono)] text-[11.5px] text-[#9a937f]",
    body: "text-[16px] leading-relaxed text-[#cfc8b6]",
    bullet: "text-[14.5px] leading-relaxed text-[#e1dbcb]",
    marker: "pt-[2px] font-[family-name:var(--w-mono)] text-[11px] text-[#00e08a]",
    markerChar: "▲",
    tag: "bg-[#0f1512] px-2 py-1 font-[family-name:var(--w-mono)] text-[10.5px] text-[#00e08a] ring-1 ring-[#00e08a]/25",
    link: "font-[family-name:var(--w-mono)] text-[11.5px] text-[#ffb000] underline-offset-4 hover:underline cursor-pointer",
    button:
      "bg-[#00e08a] px-4 py-2.5 font-[family-name:var(--w-mono)] text-[13px] font-bold uppercase tracking-wide text-[#050608] hover:bg-[#5bffbf]",
    barTrack: "bg-[#2a0f14]",
    barFill: "bg-[#00e08a]",
    divider: "border-t border-[#ffb000]/15",
  },
  hud: {
    bar: "border-b border-[#ffb000]/20 bg-[#050608]/90 font-[family-name:var(--w-mono)] text-[11px] uppercase",
    brand: "font-[family-name:var(--w-mono)] text-[13px] font-bold text-[#ffb000]",
    item: "text-[#9a937f] hover:text-[#f5f1e6]",
    itemActive: "text-[#ffb000]",
    button: "bg-[#ffb000] px-3 py-1 font-bold text-[#050608] hover:bg-[#ffd166]",
  },
};
