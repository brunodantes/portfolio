"use client";

import { useEffect, useRef, useState } from "react";
import { FileDown, Menu, X } from "lucide-react";
import FxButton from "./ui/FxButton";
import { sectionIds } from "@/lib/site-data";
import { setPreferences, useContent, usePreferences } from "@/lib/preferences";
import type { Locale, SectionId } from "@/lib/types";

const locales: Locale[] = ["pt", "en"];

/** Seção visível no meio da tela, para marcar o item ativo do menu. */
function useActiveSection() {
  const [active, setActive] = useState<SectionId>("inicio");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id as SectionId);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);
  return active;
}

export default function Header() {
  const { ui, player } = useContent();
  const { locale } = usePreferences();
  const active = useActiveSection();
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    }
    function outside(event: MouseEvent) {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("keydown", keydown);
    document.addEventListener("click", outside);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("click", outside);
    };
  }, [open]);

  const links = sectionIds.map((id) => (
    <a
      key={id}
      href={`#${id}`}
      onClick={() => setOpen(false)}
      aria-current={active === id ? "location" : undefined}
      className={`rounded-[3px] border px-3 py-2 text-[14px] transition-colors ${active === id ? "border-line-strong text-accent-text" : "border-transparent text-muted hover:text-title"}`}
    >
      {ui.nav[id]}
    </a>
  ));

  const tools = (
    <div className="flex items-center gap-4">
      <div role="group" aria-label="Idioma / Language" className="flex items-center gap-0.5">
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            lang={l === "en" ? "en" : "pt-BR"}
            aria-pressed={locale === l}
            onClick={() => setPreferences({ locale: l })}
            className={`hud cursor-pointer rounded-[3px] border px-2.5 py-1.5 transition-colors ${locale === l ? "border-line-strong text-accent-text" : "border-transparent text-muted hover:text-title"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <FxButton href={player.resumeUrl} external variant="secondary" size="sm" icon={FileDown}>
        {ui.resumeBtn}
      </FxButton>
    </div>
  );

  return (
    <header
      ref={header}
      className="sticky top-0 z-40 border-b border-line bg-deep/70 px-page py-3 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6">
        <a href="#inicio" onClick={() => setOpen(false)} className="font-display text-[13px] uppercase text-title">
          {player.name}
        </a>

        <nav aria-label={ui.navLabel} className="hidden items-center gap-1 md:flex">
          {links}
        </nav>
        <div className="hidden md:block">{tools}</div>

        <button
          ref={button}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? ui.menuClose : ui.menuOpen}
          className="grid size-9 cursor-pointer place-items-center rounded-[3px] border border-line text-body md:hidden"
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      {open && (
        <div id="menu-mobile" className="mx-auto mt-3 grid max-w-[1200px] gap-4 border-t border-line pt-4 md:hidden">
          <nav aria-label={ui.navLabel} className="grid gap-1">
            {links}
          </nav>
          {tools}
        </div>
      )}
    </header>
  );
}
