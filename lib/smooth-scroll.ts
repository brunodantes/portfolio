import type Lenis from "lenis";

/** Instância ativa do Lenis (criada em components/SmoothScroll.tsx); null com movimento desligado. */
export const smoothScroll: { lenis: Lenis | null } = { lenis: null };

/** Rola até o topo usando o Lenis quando ativo (o scroll nativo brigaria com ele). */
export function scrollToTop() {
  if (smoothScroll.lenis) {
    smoothScroll.lenis.scrollTo(0, { duration: 1.6 });
    return;
  }
  const reduced = document.documentElement.dataset.motion === "off";
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
}

/** Rola até um elemento (com deslocamento para o header fixo), pelo Lenis quando ativo. */
export function scrollToElement(el: HTMLElement, offset = 0) {
  if (smoothScroll.lenis) {
    smoothScroll.lenis.scrollTo(el, { offset, duration: 1.4 });
    return;
  }
  const reduced = document.documentElement.dataset.motion === "off";
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
}
