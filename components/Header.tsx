"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { navLinks, siteConfig } from "@/lib/site-data";

export default function Header() {
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

  return (
    <header
      ref={header}
      className="sticky top-0 z-30 border-b border-line bg-paper/90 px-6 py-5 backdrop-blur-sm md:px-12"
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6">
        <a href="#" className="font-display text-[22px] text-ink" onClick={() => setOpen(false)}>
          {siteConfig.name}
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-8 text-sm md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-soft hover:text-accent">
              {link.label}
            </a>
          ))}
        </nav>

        <button
          ref={button}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="text-ink md:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <nav
          id="menu-mobile"
          aria-label="Principal"
          className="mx-auto mt-5 flex max-w-[1200px] flex-col gap-4 border-t border-line pt-5 text-sm md:hidden"
        >
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-soft hover:text-accent">
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
