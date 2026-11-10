export type NavLink = { label: string; href: string };

export type Cta = { label: string; href: string };

export type ImageAsset = { src: string; alt: string };

export type HeroContent = {
  eyebrow: string;
  /** Início do título; `titleEm` aparece em itálico logo depois. */
  titleStart: string;
  titleEm?: string;
  titleEnd?: string;
  lead: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
  /** Sem imagem, o Hero exibe um Placeholder. */
  image?: ImageAsset;
};

export type Feature = { title: string; description: string; href?: string };

export type FaqItem = { q: string; a: string };

export type SectionCopy = { eyebrow: string; title: string; intro?: string };
