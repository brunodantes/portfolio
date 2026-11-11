"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useContent } from "@/lib/preferences";

/** 404 no tema da sala tática: coordenada fora do mapa. */
export default function NotFoundContent() {
  const { ui } = useContent();
  const t = ui.notFound;
  return (
    <section className="relative grid min-h-svh place-items-center overflow-hidden px-6">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgb(76_201_240/0.14),transparent_60%)]"
      />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(var(--p-faint)_1px,transparent_1px),linear-gradient(90deg,var(--p-faint)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20 [mask-image:radial-gradient(circle_at_50%_50%,#000,transparent_70%)]" />
      <div className="relative grid max-w-[46ch] justify-items-start gap-5 border border-accent/25 bg-surface/80 p-8 backdrop-blur-md">
        <span className="font-mono text-[13px] text-signal">{t.code}</span>
        <h1 className="font-display text-[30px] font-semibold uppercase leading-tight tracking-wide text-title">{t.title}</h1>
        <p className="text-[16px] text-soft">{t.lead}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-signal px-4 py-2.5 font-display text-[15px] font-semibold uppercase tracking-wide text-on-signal hover:bg-signal-hover"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {t.back}
        </Link>
      </div>
    </section>
  );
}
