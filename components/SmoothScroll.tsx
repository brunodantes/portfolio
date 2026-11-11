"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePreferences } from "@/lib/preferences";
import { smoothScroll } from "@/lib/smooth-scroll";

/** Scroll com inércia (Lenis), inclusive nas âncoras do menu. Desligado com movimento desligado. */
export default function SmoothScroll() {
  const { motion } = usePreferences();
  useEffect(() => {
    if (!motion) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1, anchors: { offset: -72 } });
    smoothScroll.lenis = lenis;
    return () => {
      smoothScroll.lenis = null;
      lenis.destroy();
    };
  }, [motion]);
  return null;
}
