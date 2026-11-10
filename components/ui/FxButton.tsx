"use client";

import { useRef, type ComponentType, type PointerEvent } from "react";

type FxButtonProps = {
  children: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  /** Ícone (lucide-react) depois do texto. */
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  href: string;
  /** Abre em nova aba com rel="noopener noreferrer". */
  external?: boolean;
  className?: string;
};

const MAGNET = 0.28;
const MAGNET_Y = 0.38;
const LABEL_PARALLAX = 0.14;

/**
 * Botão "vivo" do dunkode-site, no formato do HUD: magnético, feixe de luz na borda e
 * preenchimento que nasce do ponto de entrada do cursor. Estilos em globals.css (`.fx-*`).
 * Sem mouse ou com movimento desligado, fica só a troca de cor.
 */
export default function FxButton({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  href,
  external,
  className = "",
}: FxButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  function origin(event: PointerEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--fx-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--fx-y", `${event.clientY - rect.top}px`);
    return rect;
  }

  function move(event: PointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse") return;
    const el = ref.current;
    const rect = origin(event);
    if (!el || !rect || document.documentElement.dataset.motion === "off") return;
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    el.style.setProperty("--fx-tx", `${dx * MAGNET}px`);
    el.style.setProperty("--fx-ty", `${dy * MAGNET_Y}px`);
    el.style.setProperty("--fx-lx", `${dx * LABEL_PARALLAX}px`);
    el.style.setProperty("--fx-ly", `${dy * LABEL_PARALLAX}px`);
    el.dataset.magnet = "on";
  }

  function leave(event: PointerEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    origin(event);
    for (const v of ["--fx-tx", "--fx-ty", "--fx-lx", "--fx-ly"]) el.style.setProperty(v, "0px");
    el.dataset.magnet = "off";
  }

  return (
    <a
      ref={ref}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`fx-btn fx-${variant} fx-${size} ${className}`}
      onPointerEnter={origin}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      <span className="fx-fill" aria-hidden />
      <span className="fx-label">{children}</span>
      {Icon && (
        <span className="fx-icon">
          <Icon className="size-4" aria-hidden />
        </span>
      )}
    </a>
  );
}
