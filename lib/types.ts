export type Locale = "pt" | "en";

/** Nome de um SVG em `public/assets/icons/tech/` (sem extensão). */
export type TechIconName =
  | "amazonaws"
  | "angular"
  | "claude"
  | "csharp"
  | "datadog"
  | "devin"
  | "docker"
  | "dotnet"
  | "html5"
  | "javascript"
  | "kubernetes"
  | "microsoftsqlserver"
  | "mongodb"
  | "nextdotjs"
  | "opensearch"
  | "oracle"
  | "postgresql"
  | "rabbitmq"
  | "react"
  | "typescript";

/** Tecnologia exibida como tag; sem ícone quando não há logo. */
export type Tech = { label: string; icon?: TechIconName };

export type Tone = "accent" | "signal" | "plain";

export type Stat = { value: string; unit?: string; label: string; tone: Tone };

export type Skill = { label: string; value: number; caption: string; tone?: "accent" | "signal" };

export type StackGroupIcon = "server" | "code" | "cloud" | "layers" | "database" | "activity" | "cpu";

export type StackGroup = { group: string; icon: StackGroupIcon; items: string[] };

export type Job = {
  org: string;
  role?: string;
  period: string;
  current?: boolean;
  bullets: string[];
  stack: Tech[];
  /** Mundos de jogo: nível alcançado nessa fase e conquistas (resultados resumidos). */
  level: number;
  achievements: string[];
};

export type Education = { course: string; where: string };

export type Player = {
  name: string;
  fullName: string;
  role: string;
  city: string;
  level: string;
  linkedin: string;
  github: string;
  phone: string;
  summary: string;
  resumeUrl: string;
};

export type SectionId = "inicio" | "trajetoria" | "stack" | "contato";

export type Content = {
  player: Player;
  ui: {
    nav: Record<SectionId, string>;
    navLabel: string;
    skip: string;
    menuOpen: string;
    menuClose: string;
    resumeBtn: string;
    hero: {
      headline: string;
      focusKicker: string;
      panelLabel: string;
      ctaPrimary: string;
      ctaSecondary: string;
      /** Dica de scroll e fecho dos heroes 3D. */
      hint: string;
      outroTitle: string;
      outroLead: string;
    };
    about: { title: string; lead: string; current: string; education: string; english: string };
    stack: { title: string; lead: string; sheetLabel: string; sheetIdle: string; sheetSync: string };
    contact: {
      title: string;
      lead: string;
      channels: { linkedin: string; github: string; phone: string; resume: string };
      hints: { linkedin: string; github: string; phone: string; resume: string };
      motion: string;
    };
    notFound: { title: string; lead: string; back: string };
    /** Textos da interface de jogo (mundos de jogo). */
    game: {
      player: string;
      start: string;
      tutorial: string;
      mission: string;
      done: string;
      active: string;
      objectives: string;
      achievements: string;
      gear: string;
      skillTree: string;
      newMission: string;
      accept: string;
      levelUp: string;
      map: string;
    };
    /** Textos dos mundos 3D (/mundos). */
    worlds: {
      originTitle: string;
      originLead: string;
      scrollHint: string;
      more: string;
      less: string;
      chapters: string;
    };
  };
  builds: string[];
  stats: Stat[];
  skills: Skill[];
  stack: StackGroup[];
  experience: Job[];
  education: Education[];
};

/** Direções do hero em comparação (PLANO.md, seção 2). `hud` é o hero 2D atual. */
export type HeroVariant = "hud" | "pacote" | "cluster" | "chip" | "player";
