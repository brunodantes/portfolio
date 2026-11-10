"use client";

import { ChevronLeft } from "lucide-react";
import FxButton from "./ui/FxButton";
import { useContent } from "@/lib/preferences";

export default function NotFoundContent() {
  const { ui } = useContent();
  const t = ui.notFound;
  return (
    <section className="grid min-h-[70vh] place-items-center px-page py-section">
      <div className="grid max-w-[44ch] justify-items-start gap-5">
        <span className="font-mono text-[13px] text-accent-text">HTTP 404</span>
        <h1 className="font-display text-[28px] uppercase leading-tight md:text-[36px]">{t.title}</h1>
        <p className="text-[17px] text-muted">{t.lead}</p>
        <FxButton href="/" icon={ChevronLeft}>
          {t.back}
        </FxButton>
      </div>
    </section>
  );
}
