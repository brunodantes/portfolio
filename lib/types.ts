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


export type Content = {
  player: Player;
  ui: {
    skip: string;
    resumeBtn: string;
    motion: string;
    headline: string;
    chapters: string;
    more: string;
    less: string;
    briefing: {
      kicker: string;
      specialties: string;
      education: string;
      english: string;
      ctaPrimary: string;
      ctaResume: string;
    };
    op: { label: string; done: string; active: string; objectives: string; results: string; gear: string };
    skills: { kicker: string; title: string; lead: string };
    contact: {
      label: string;
      kicker: string;
      title: string;
      lead: string;
      cta: string;
      github: string;
      phone: string;
      resume: string;
    };
    hud: { levelUp: string; map: string };
    notFound: { code: string; title: string; lead: string; back: string };
  };
  builds: string[];
  stats: Stat[];
  skills: Skill[];
  stack: StackGroup[];
  experience: Job[];
  education: Education[];
};

