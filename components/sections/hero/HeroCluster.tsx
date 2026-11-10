"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import HeroIntro from "./HeroIntro";
import { useDeviceProfile } from "@/lib/device";
import { usePalette } from "@/lib/palette";
import { useContent, usePreferences } from "@/lib/preferences";
import { useScrollProgress } from "@/lib/use-scroll-progress";

const ClusterScene = dynamic(() => import("../../three/cluster/ClusterScene"), { ssr: false });

/**
 * Hero "Malha distribuída": seção alta com a cena presa na tela. O scroll leva a malha do caos
 * à arquitetura (`--p` no CSS + ref para a cena); o texto sai e entra o fecho.
 * Com movimento desligado, a seção tem a altura da tela e a malha já aparece organizada.
 */
export default function HeroCluster() {
  const { ui } = useContent();
  const { motion } = usePreferences();
  const device = useDeviceProfile();
  const palette = usePalette();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(root);
  const [active, setActive] = useState(true);
  const t = ui.hero;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "100px 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="inicio"
      ref={root}
      className={`relative border-b border-line ${motion ? "h-[230svh]" : ""}`}
      style={{ "--p": motion ? 0 : 0.2 } as CSSProperties}
    >
      <div ref={stage} className={`${motion ? "sticky top-0 h-svh" : "relative min-h-[calc(100svh-61px)]"} overflow-hidden`}>
        <div className="absolute inset-0" aria-hidden>
          {device.webgl ? (
            <ClusterScene
              progress={progress}
              active={active}
              reduced={!motion}
              device={device}
              palette={palette}
              eventSource={stage}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_55%,var(--color-accent-soft),transparent_55%)]" />
          )}
        </div>

        {/* Véu para o texto ler bem sobre a malha; some com o scroll. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--p-bg)_0%,color-mix(in_oklab,var(--p-bg)_75%,transparent)_38%,transparent_64%)] max-lg:bg-[linear-gradient(180deg,var(--p-bg)_0%,color-mix(in_oklab,var(--p-bg)_82%,transparent)_48%,transparent_72%)]"
          style={{ opacity: "clamp(0, calc(1 - (var(--p) - 0.06) * 5), 1)" }}
        />

        <div
          className="pointer-events-none relative flex h-full items-center px-page py-16 max-lg:items-start max-lg:pt-[84px] [&_a]:pointer-events-auto"
          style={{
            opacity: "clamp(0, calc(1 - (var(--p) - 0.05) * 6), 1)",
            transform: "translateY(calc(var(--p) * -160px))",
          }}
        >
          <HeroIntro className="mx-auto w-full max-w-[1200px] [&>*]:max-w-[600px]" />
        </div>

        {motion && (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-6 left-0 w-full px-page text-center font-mono text-[12px] text-muted"
              style={{ opacity: "clamp(0, calc(1 - var(--p) * 10), 1)" }}
            >
              {t.hint}
            </span>

            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 px-page pb-[12svh]"
              style={{ opacity: "calc(clamp(0, (var(--p) - 0.6) * 5, 1) * clamp(0, (0.98 - var(--p)) * 10, 1))" }}
            >
              <div className="mx-auto grid max-w-[1200px] gap-3">
                <p className="font-display text-[24px] uppercase leading-tight text-title md:text-[34px]">{t.outroTitle}</p>
                <p className="max-w-[56ch] text-[16px] leading-relaxed text-muted">{t.outroLead}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
