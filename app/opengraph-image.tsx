import { ImageResponse } from "next/og";
import { content, siteConfig } from "@/lib/site-data";

// Imagem de compartilhamento (WhatsApp, LinkedIn…) no visual da sala tática. Gerada no build.

export const alt = `${siteConfig.name} — Senior Software Engineer / Tech Lead`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#03060c";
const HOLO = "#4cc9f0";
const AMBER = "#ffb347";

/** Curvas de nível sugeridas por anéis concêntricos (o satori não desenha shaders). */
const rings = [
  { x: 860, y: 330, r: [70, 130, 190, 250] },
  { x: 1080, y: 120, r: [50, 100, 150] },
  { x: 700, y: 560, r: [60, 110] },
];

export default function OpengraphImage() {
  const pt = content.pt;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: BG, position: "relative", fontFamily: "sans-serif" }}>
        {rings.flatMap((g) =>
          g.r.map((r, i) => (
            <div
              key={`${g.x}-${r}`}
              style={{
                position: "absolute",
                left: g.x - r,
                top: g.y - r * 0.62,
                width: r * 2,
                height: r * 1.24,
                borderRadius: "50%",
                border: `2px solid ${HOLO}`,
                opacity: 0.55 - i * 0.1,
              }}
            />
          )),
        )}
        <div style={{ position: "absolute", left: 846, top: 316, width: 28, height: 28, background: AMBER, transform: "rotate(45deg)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 640, height: 630, display: "flex", background: `linear-gradient(90deg, ${BG} 70%, transparent)` }} />
        <div style={{ position: "absolute", left: 24, top: 24, right: 24, bottom: 24, display: "flex", border: `1px solid ${HOLO}55` }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px", gap: 22, width: 760 }}>
          <div style={{ display: "flex", color: AMBER, fontSize: 24, letterSpacing: 3 }}>BRIEFING · {pt.player.level}</div>
          <div style={{ display: "flex", color: "#f0fbff", fontSize: 76, fontWeight: 700, lineHeight: 1 }}>{siteConfig.name}</div>
          <div style={{ display: "flex", color: HOLO, fontSize: 32 }}>{pt.player.role}</div>
          <div style={{ display: "flex", color: "#b5d0dd", fontSize: 30, lineHeight: 1.3 }}>{pt.ui.headline}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            {[".NET", "AWS", "Kubernetes", "RabbitMQ", "React"].map((t) => (
              <div key={t} style={{ display: "flex", border: `1px solid ${HOLO}88`, color: "#9fdcf2", fontSize: 22, padding: "6px 14px" }}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
