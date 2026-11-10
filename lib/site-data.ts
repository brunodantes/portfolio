import type { FaqItem, Feature, HeroContent, NavLink, SectionCopy } from "./types";

// Todo o conteúdo editável do site. Componentes apenas leem estes dados.

const lang = "pt-BR";

export const siteConfig = {
  name: "Bruno Almeida",
  title: "Bruno Almeida — frase curta de posicionamento",
  description: "Uma ou duas frases que resumem a proposta, usadas em buscadores e redes sociais.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  lang,
  ogLocale: lang.replace("-", "_"),
  contact: {
    email: "contato@exemplo.com",
    /** Só dígitos, com DDI. Vazio esconde o botão. */
    whatsapp: "",
  },
};

/** Âncoras da landing: cada `href` aponta para o `id` de uma seção em app/page.tsx. */
export const navLinks: NavLink[] = [
  { label: "Sobre", href: "#sobre" },
  { label: "Serviços", href: "#servicos" },
  { label: "Dúvidas", href: "#duvidas" },
  { label: "Contato", href: "#contato" },
];

export const socialLinks: NavLink[] = [];

export const hero: HeroContent = {
  eyebrow: "Eyebrow curto",
  titleStart: "Título principal com",
  titleEm: "destaque",
  titleEnd: "em itálico",
  lead: "Parágrafo de apoio que explica em uma frase o que é oferecido e para quem.",
  primaryCta: { label: "Fale com a gente", href: "#contato" },
  secondaryCta: { label: "Ver serviços", href: "#servicos" },
};

export const about: SectionCopy & { paragraphs: string[] } = {
  eyebrow: "Sobre",
  title: "Quem somos",
  paragraphs: [
    "Primeiro parágrafo sobre a história, a missão ou a pessoa por trás do projeto.",
    "Segundo parágrafo com diferenciais e o que torna a proposta confiável.",
  ],
};

export const servicesCopy: SectionCopy = {
  eyebrow: "Serviços",
  title: "O que oferecemos",
  intro: "Uma frase que apresenta a lista abaixo.",
};

export const features: Feature[] = [
  { title: "Serviço um", description: "Descrição objetiva do primeiro serviço." },
  { title: "Serviço dois", description: "Descrição objetiva do segundo serviço." },
  { title: "Serviço três", description: "Descrição objetiva do terceiro serviço." },
];

export const faqCopy: SectionCopy = { eyebrow: "Dúvidas", title: "Perguntas frequentes" };

export const faq: FaqItem[] = [
  { q: "Pergunta frequente um?", a: "Resposta direta para a primeira pergunta." },
  { q: "Pergunta frequente dois?", a: "Resposta direta para a segunda pergunta." },
  { q: "Pergunta frequente três?", a: "Resposta direta para a terceira pergunta." },
];

export const contact: SectionCopy & { whatsappMessage: string } = {
  eyebrow: "Contato",
  title: "Vamos conversar?",
  intro: "Convite curto para o contato.",
  whatsappMessage: "Olá! Vim pelo site e gostaria de mais informações.",
};
