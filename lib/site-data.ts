import type { Content, HeroVariant, Locale, SectionId, Skill, Stat, StackGroup, Tech } from "./types";

// Todo o conteúdo editável do site, nos dois idiomas. Componentes apenas leem estes dados.

export const siteConfig = {
  name: "Bruno Almeida",
  title: "Bruno Almeida — Senior Software Engineer / Tech Lead",
  description:
    "Portfólio de Bruno Almeida, Senior Software Engineer / Tech Lead especializado em .NET, React, AWS, arquitetura distribuída e sistemas financeiros de alta disponibilidade.",
  ogDescription:
    "Mais de 9 anos projetando, desenvolvendo e escalando sistemas distribuídos de alta disponibilidade para o mercado financeiro.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  lang: "pt-BR",
  ogLocale: "pt_BR",
  defaultLocale: "pt" as Locale,
  /** Hero da home. Troque quando a direção final for escolhida em /conceitos. */
  heroVariant: "hud" satisfies HeroVariant as HeroVariant,
};

/** Prévias em /conceitos/<slug> (fora do menu, do sitemap e com noindex). */
export const heroVariants: { slug: HeroVariant; name: string; ready: boolean }[] = [
  { slug: "hud", name: "HUD 2D (atual)", ready: true },
  { slug: "pacote", name: "Pacote de dados", ready: true },
  { slug: "cluster", name: "Malha distribuída", ready: true },
  { slug: "chip", name: "Placa de circuito", ready: false },
  { slug: "player", name: "Seleção de personagem", ready: false },
];

/** Ordem das seções da página; o `id` de cada uma é a âncora do menu. */
export const sectionIds: SectionId[] = ["inicio", "trajetoria", "stack", "contato"];

const resumeUrls: Record<Locale, string> = {
  pt: "/resume/Bruno_Almeida_Resume_PTBR.pdf",
  en: "/resume/Bruno_Almeida_Resume_EN.pdf",
};

/** Tags do painel do hero. */
export const playerStack: Tech[] = [
  { icon: "csharp", label: "C#" },
  { icon: "dotnet", label: ".NET" },
  { icon: "react", label: "React" },
  { icon: "nextdotjs", label: "Next.js" },
  { icon: "typescript", label: "TypeScript" },
  { icon: "angular", label: "Angular" },
  { icon: "amazonaws", label: "AWS" },
  { icon: "docker", label: "Docker" },
  { icon: "kubernetes", label: "Kubernetes" },
  { icon: "postgresql", label: "PostgreSQL" },
  { icon: "microsoftsqlserver", label: "SQL Server" },
  { icon: "oracle", label: "Oracle" },
  { icon: "mongodb", label: "MongoDB" },
  { icon: "rabbitmq", label: "RabbitMQ" },
  { icon: "datadog", label: "Datadog" },
  { icon: "opensearch", label: "OpenSearch" },
  { icon: "claude", label: "Claude" },
  { icon: "devin", label: "Devin" },
];

export const marqueeItems = [
  "C# / .NET",
  "React",
  "Next.js",
  "AWS",
  "Kubernetes",
  "Docker",
  "RabbitMQ",
  "PostgreSQL",
  "MongoDB",
  "Datadog",
  "OpenSearch",
  "Event-Driven",
];

const itauStack: Tech[] = [
  { icon: "dotnet", label: ".NET 10" },
  { icon: "react", label: "React 19" },
  { label: "Vite" },
  { icon: "docker", label: "Docker" },
  { icon: "amazonaws", label: "AWS" },
  { label: "ECS" },
  { label: "API Gateway" },
  { label: "DynamoDB" },
  { icon: "datadog", label: "Datadog" },
  { icon: "devin", label: "Devin" },
];

const btgStack: Tech[] = [
  { icon: "dotnet", label: ".NET" },
  { icon: "react", label: "React" },
  { icon: "nextdotjs", label: "Next.js" },
  { icon: "kubernetes", label: "Kubernetes" },
  { icon: "amazonaws", label: "AWS" },
  { icon: "rabbitmq", label: "RabbitMQ" },
  { icon: "postgresql", label: "PostgreSQL" },
  { icon: "datadog", label: "Datadog" },
  { icon: "opensearch", label: "OpenSearch" },
];

const sinqiaStack: Tech[] = [
  { icon: "dotnet", label: ".NET" },
  { icon: "microsoftsqlserver", label: "SQL Server" },
  { icon: "oracle", label: "Oracle" },
  { icon: "rabbitmq", label: "RabbitMQ" },
  { icon: "angular", label: "Angular" },
  { icon: "kubernetes", label: "AKS" },
];

const nestleStack: Tech[] = [
  { icon: "dotnet", label: ".NET" },
  { label: "Entity Framework" },
  { icon: "javascript", label: "JavaScript" },
  { icon: "html5", label: "HTML/CSS" },
];

const stats: Record<Locale, Stat[]> = {
  pt: [
    { value: "9", unit: "anos", label: "Engenharia", tone: "accent" },
    { value: "2", label: "Squads lideradas", tone: "signal" },
    { value: "4", label: "Fintechs / bancos", tone: "accent" },
    { value: "2", label: "Idiomas", tone: "plain" },
  ],
  en: [
    { value: "9", unit: "years", label: "Engineering", tone: "accent" },
    { value: "2", label: "Squads led", tone: "signal" },
    { value: "4", label: "Fintechs / banks", tone: "accent" },
    { value: "2", label: "Languages", tone: "plain" },
  ],
};

const skills: Record<Locale, Skill[]> = {
  pt: [
    { label: "C# / .NET Core", value: 96, caption: "9 anos" },
    { label: "Arquitetura distribuída", value: 90, caption: "Event-driven" },
    { label: "AWS / Kubernetes", value: 82, caption: "Docker · CI/CD", tone: "signal" },
    { label: "React / Next.js", value: 78, caption: "TypeScript" },
    { label: "Mensageria", value: 88, caption: "RabbitMQ" },
    { label: "Observabilidade", value: 75, caption: "Datadog · OpenSearch", tone: "signal" },
    { label: "IA aplicada ao SDLC", value: 72, caption: "AI-DLC · Agentes" },
  ],
  en: [
    { label: "C# / .NET Core", value: 96, caption: "9 years" },
    { label: "Distributed architecture", value: 90, caption: "Event-driven" },
    { label: "AWS / Kubernetes", value: 82, caption: "Docker · CI/CD", tone: "signal" },
    { label: "React / Next.js", value: 78, caption: "TypeScript" },
    { label: "Messaging", value: 88, caption: "RabbitMQ" },
    { label: "Observability", value: 75, caption: "Datadog · OpenSearch", tone: "signal" },
    { label: "AI applied to the SDLC", value: 72, caption: "AI-DLC · Agents" },
  ],
};

const stack: Record<Locale, StackGroup[]> = {
  pt: [
    { group: "Backend & APIs", icon: "server", items: ["C#", ".NET Core", "ASP.NET Core", "REST APIs", "Dapper", "Entity Framework"] },
    { group: "Frontend", icon: "code", items: ["React", "Next.js", "Angular", "TypeScript"] },
    { group: "Cloud & DevOps", icon: "cloud", items: ["AWS", "Docker", "Kubernetes", "CI/CD"] },
    { group: "Arquitetura", icon: "layers", items: ["Microservices", "Distributed Systems", "Event-Driven Architecture"] },
    { group: "Dados & Mensageria", icon: "database", items: ["PostgreSQL", "SQL Server", "Oracle", "MongoDB", "DynamoDB", "RabbitMQ"] },
    { group: "Observabilidade", icon: "activity", items: ["Datadog", "OpenSearch"] },
    { group: "IA & Automação de Dev", icon: "cpu", items: ["AI-DLC (AWS)", "Claude", "Devin", "Agentic Development"] },
  ],
  en: [
    { group: "Backend & APIs", icon: "server", items: ["C#", ".NET Core", "ASP.NET Core", "REST APIs", "Dapper", "Entity Framework"] },
    { group: "Frontend", icon: "code", items: ["React", "Next.js", "Angular", "TypeScript"] },
    { group: "Cloud & DevOps", icon: "cloud", items: ["AWS", "Docker", "Kubernetes", "CI/CD"] },
    { group: "Architecture", icon: "layers", items: ["Microservices", "Distributed Systems", "Event-Driven Architecture"] },
    { group: "Data & Messaging", icon: "database", items: ["PostgreSQL", "SQL Server", "Oracle", "MongoDB", "DynamoDB", "RabbitMQ"] },
    { group: "Observability", icon: "activity", items: ["Datadog", "OpenSearch"] },
    { group: "AI & Dev Automation", icon: "cpu", items: ["AI-DLC (AWS)", "Claude", "Devin", "Agentic Development"] },
  ],
};

const pt: Content = {
  player: {
    name: "Bruno Almeida",
    fullName: "Bruno Dantas de Almeida",
    role: "Senior Software Engineer / Tech Lead",
    city: "São Paulo, Brasil",
    level: "LV 09",
    linkedin: "linkedin.com/in/bdalme",
    github: "github.com/brunodantes",
    phone: "+55 (11) 99651-6112",
    summary:
      "Engenheiro de software sênior e tech lead com mais de 9 anos projetando, desenvolvendo e escalando sistemas distribuídos de alta disponibilidade para o mercado financeiro.",
    resumeUrl: resumeUrls.pt,
  },
  ui: {
    nav: { inicio: "Início", trajetoria: "Trajetória", stack: "Equipamento", contato: "Contato" },
    navLabel: "Principal",
    skip: "Pular para o conteúdo",
    menuOpen: "Abrir menu",
    menuClose: "Fechar menu",
    resumeBtn: "Currículo",
    hero: {
      headline: "Construo sistemas que não param.",
      focusKicker: "Em foco",
      panelLabel: "Player / Stats",
      ctaPrimary: "Ver trajetória",
      ctaSecondary: "Falar comigo",
      hint: "Role para organizar a malha · clique para disparar um evento",
      outroTitle: "Do caos à arquitetura.",
      outroLead: "Requisições entram pela borda, passam pelos serviços e pelo broker e chegam aos dados. Sem perder mensagem.",
    },
    about: {
      title: "Trajetória",
      lead: "Mais de 9 anos em engenharia de software — de sistemas web internos a plataformas financeiras de alta disponibilidade.",
      current: "Atual",
      education: "Formação",
      english: "Inglês avançado",
    },
    stack: {
      title: "Stack e proficiência",
      lead: "O que uso todos os dias, com o tempo de estrada em cada item.",
      sheetLabel: "Ficha do personagem",
      sheetIdle: "idle",
      sheetSync: "sync",
    },
    contact: {
      title: "Próxima fase",
      lead: "Aberto a conversas sobre engenharia de plataforma, arquitetura distribuída e liderança técnica.",
      channels: { linkedin: "LinkedIn", github: "GitHub", phone: "Telefone", resume: "Currículo" },
      hints: {
        linkedin: "Conecte-se comigo",
        github: "Veja meus repositórios",
        phone: "Ligue ou mande mensagem",
        resume: "Baixe o currículo completo",
      },
      motion: "Movimento",
    },
    notFound: {
      title: "Essa rota não existe.",
      lead: "O endereço pode ter mudado ou foi digitado errado.",
      back: "Voltar para o início",
    },
    worlds: {
      originTitle: "Origem",
      originLead: "Antes do código, circuitos: a formação técnica em eletrônica e a graduação em gestão de TI.",
      scrollHint: "Role para percorrer",
      more: "Ver tudo",
      less: "Ver menos",
      chapters: "Capítulos",
    },
  },
  builds: [
    "sistemas distribuídos",
    "plataformas de investimento",
    "APIs de alta disponibilidade",
    "microsserviços em .NET",
    "engenharia acelerada por IA",
  ],
  stats: stats.pt,
  skills: skills.pt,
  stack: stack.pt,
  experience: [
    {
      org: "Itaú Unibanco",
      role: "Senior Software Engineer",
      period: "Mar 2026 — Atual",
      current: true,
      bullets: [
        "Desenvolvimento full-stack, desde o início do projeto, de uma calculadora de sucessão para apoiar o planejamento sucessório e patrimonial de clientes do Private Bank.",
        "Implementação de backend, frontend e integrações em uma arquitetura AWS com .NET 10, React 19 e Vite, BFF, API Gateway, containers Docker no ECS, Elastic Load Balancing e DynamoDB.",
        "Construção de integrações entre APIs com Refit e Polly, aplicando políticas de retry, timeout e circuit breaker para ampliar a resiliência da solução.",
        "Estruturação de um fluxo de desenvolvimento orientado por IA com o AI-DLC da AWS, cobrindo preparação e refinamento de histórias, planejamento técnico, implementação, testes, revisão e documentação com apoio de Devin e Claude.",
        "Criação e compartilhamento de skills reutilizáveis para gerar interfaces a partir de componentes do Figma, construir contratos do API Gateway e disseminar padrões e boas práticas de React e .NET para a comunidade de engenharia.",
        "Aplicação do fluxo com IA contribuindo para uma redução próxima de 80% no tempo de conclusão das histórias, com maior padronização e agilidade na entrega.",
        "Participação ativa no refinamento do backlog e nas decisões técnicas, propondo melhorias no design da ferramenta e promovendo qualidade com testes unitários e de integração usando xUnit, mocks, AutoBogus, Jest e Cypress, além de observabilidade com logs, métricas, tracing e dashboards no Datadog e CloudWatch.",
      ],
      stack: itauStack,
    },
    {
      org: "BTG Pactual / Necton",
      role: "Senior Software Engineer / Tech Lead",
      period: "Jun 2023 — Mar 2026",
      bullets: [
        "Liderança técnica no desenvolvimento e evolução do Necton Portal e de sistemas de risco integrados à LiNe da B3, definindo padrões arquiteturais, promovendo qualidade de código e apoiando tecnicamente a squad. O LiNe é a plataforma de gestão de risco pré-negociação da B3, integrada ao ambiente de negociação e utilizada para definição e validação de limites de negociação.",
        "Arquitetura e evolução de microsserviços distribuídos utilizando .NET, AWS e Kubernetes, priorizando alta disponibilidade, resiliência, escalabilidade e observabilidade.",
        "Desenvolvimento do Necton Portal, plataforma responsável por automatizar processos de Middle Office, geração e distribuição de documentos financeiros, gestão operacional e integrações entre serviços críticos do ambiente financeiro, com frontend em React e Next.js.",
        "Modernização da plataforma de geração e distribuição de documentos financeiros, substituindo um fluxo legado por uma arquitetura orientada a eventos utilizando RabbitMQ, reduzindo a latência entre geração e entrega dos documentos.",
        "Projeto da estratégia de processamento concorrente para consumidores distribuídos executando em múltiplos pods Kubernetes, implementando controle de concorrência com PostgreSQL Advisory Transaction Locks para garantir o processamento único de cada execução lógica e eliminar condições de corrida.",
        "Modelagem da orquestração de execuções compostas por múltiplos documentos, com regras de conclusão, controle de estado do processamento e fluxo automatizado de distribuição dos arquivos.",
        "Integração com AWS S3 e Amazon RDS para armazenamento, gerenciamento e distribuição automatizada de documentos financeiros.",
        "Desenvolvimento de soluções para plataformas de risco, integrando serviços internos ao LiNe da B3 para apoiar processos de validação de limites, monitoramento de risco e fluxos operacionais do mercado financeiro.",
        "Otimização de desempenho através da evolução de consultas e índices PostgreSQL, além da implementação de observabilidade utilizando Datadog e OpenSearch para monitoramento e diagnóstico em produção.",
      ],
      stack: btgStack,
    },
    {
      org: "Sinqia (Evertec)",
      role: "Senior Software Engineer / Tech Lead",
      period: "Jan 2018 — Jun 2023",
      bullets: [
        "Evolução técnica em uma plataforma de gestão de investimentos para bancos de investimento, atuando inicialmente na sustentação do produto e posteriormente na evolução de novas funcionalidades e liderança técnica da squad de derivativos.",
        "Investigação e resolução de incidentes envolvendo operações de renda fixa, COE, swaps, derivativos e renda variável, realizando análise de cenários, interpretação de regras de negócio, investigação de logs e correção de bugs em produção.",
        "Desenvolvimento e manutenção de aplicações ASP.NET (.NET Framework e posteriormente .NET Core), participando da modernização gradual da plataforma para arquiteturas mais modernas.",
        "Otimização de performance em SQL Server e Oracle, incluindo análise de planos de execução, criação de índices e melhorias de consultas para suportar operações financeiras de alta complexidade.",
        "Desenvolvimento de soluções para o módulo de derivativos, implementando funcionalidades voltadas ao mercado financeiro e apoiando a evolução contínua do produto.",
        "Tech Lead da squad responsável pelo backlog do módulo de derivativos, conduzindo decisões técnicas, revisões de código, refinamentos e acompanhamento do desenvolvimento da equipe.",
        "Participação na evolução da plataforma de Conta Remunerada utilizando .NET Core 3, AKS e SQL Server, contribuindo para serviços distribuídos e processamento assíncrono baseado em mensageria.",
      ],
      stack: sinqiaStack,
    },
    {
      org: "Nestlé Brasil (TopMind)",
      period: "Dez 2016 — Dez 2017",
      bullets: ["Desenvolvimento full-stack com C# MVC, Entity Framework, JavaScript, HTML e CSS."],
      stack: nestleStack,
    },
  ],
  education: [
    { course: "Tecnólogo em Gestão da Tecnologia da Informação", where: "FATEC Mauá · 2018" },
    { course: "Técnico em Eletrônica", where: "ETEC Júlio de Mesquita · 2014" },
  ],
};

const en: Content = {
  player: {
    ...pt.player,
    city: "São Paulo, Brazil",
    summary:
      "Senior software engineer and tech lead with 9+ years designing, building, and scaling high-availability distributed systems for the financial services industry.",
    resumeUrl: resumeUrls.en,
  },
  ui: {
    nav: { inicio: "Home", trajetoria: "Experience", stack: "Stack", contato: "Contact" },
    navLabel: "Main",
    skip: "Skip to content",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    resumeBtn: "Resume",
    hero: {
      headline: "I build systems that stay up.",
      focusKicker: "In focus",
      panelLabel: "Player / Stats",
      ctaPrimary: "View experience",
      ctaSecondary: "Get in touch",
      hint: "Scroll to organize the mesh · click to fire an event",
      outroTitle: "From chaos to architecture.",
      outroLead: "Requests enter at the edge, flow through services and the broker, and reach the data. No message lost.",
    },
    about: {
      title: "Experience",
      lead: "9+ years in software engineering — from internal web systems to high-availability financial platforms.",
      current: "Current",
      education: "Education",
      english: "Advanced English",
    },
    stack: {
      title: "Stack & proficiency",
      lead: "What I use every day, with time-on-the-road for each one.",
      sheetLabel: "Character sheet",
      sheetIdle: "idle",
      sheetSync: "sync",
    },
    contact: {
      title: "Next level",
      lead: "Open to conversations about platform engineering, distributed architecture, and technical leadership.",
      channels: { linkedin: "LinkedIn", github: "GitHub", phone: "Phone", resume: "Resume" },
      hints: {
        linkedin: "Connect with me",
        github: "See my repositories",
        phone: "Call or message",
        resume: "Download the full resume",
      },
      motion: "Motion",
    },
    notFound: {
      title: "This route doesn't exist.",
      lead: "The address may have changed or was mistyped.",
      back: "Back to home",
    },
    worlds: {
      originTitle: "Origin",
      originLead: "Before code, circuits: a technical degree in electronics and a degree in IT management.",
      scrollHint: "Scroll to travel",
      more: "Show all",
      less: "Show less",
      chapters: "Chapters",
    },
  },
  builds: [
    "distributed systems",
    "equity trading platforms",
    "high-availability APIs",
    ".NET microservices",
    "AI-accelerated engineering",
  ],
  stats: stats.en,
  skills: skills.en,
  stack: stack.en,
  experience: [
    {
      org: "Itaú Unibanco",
      role: "Senior Software Engineer",
      period: "Mar 2026 — Present",
      current: true,
      bullets: [
        "Full-stack development, from the project’s inception, of a succession planning calculator supporting estate and wealth planning for Private Bank clients.",
        "Backend, frontend, and integration implementation on an AWS architecture using .NET 10, React 19 and Vite, a BFF, API Gateway, Docker containers on ECS, Elastic Load Balancing, and DynamoDB.",
        "Built API integrations with Refit and Polly, applying retry, timeout, and circuit breaker policies to improve solution resilience.",
        "Established an AI-driven development workflow with AWS AI-DLC, covering story preparation and refinement, technical planning, implementation, testing, review, and documentation with support from Devin and Claude.",
        "Created and shared reusable skills for generating interfaces from Figma components, building API Gateway contracts, and disseminating React and .NET standards and best practices across the engineering community.",
        "Applied the AI-driven workflow to help reduce story completion time by nearly 80%, while increasing standardization and delivery speed.",
        "Actively contributed to backlog refinement and technical decisions, proposed improvements to the tool’s design, and promoted quality through unit and integration testing with xUnit, mocks, AutoBogus, Jest, and Cypress, supported by logs, metrics, tracing, and dashboards in Datadog and CloudWatch.",
      ],
      stack: itauStack,
    },
    {
      org: "BTG Pactual / Necton",
      role: "Senior Software Engineer / Tech Lead",
      period: "Jun 2023 — Mar 2026",
      bullets: [
        "Technical leadership for the development and evolution of the Necton Portal and risk systems integrated with B3’s LiNe, defining architectural standards, promoting code quality, and providing technical support to the squad. LiNe is B3’s pre-trade risk management platform, integrated into the trading environment and used to define and validate trading limits.",
        "Architected and evolved distributed microservices using .NET, AWS, and Kubernetes, prioritizing high availability, resilience, scalability, and observability.",
        "Developed the Necton Portal, a platform responsible for automating Middle Office processes, financial document distribution, operational management, and integrations between critical services in the financial environment, with a React and Next.js frontend.",
        "Modernized the financial document generation and distribution platform, replacing a Quartz-and-polling-based flow with an event-driven architecture using RabbitMQ, reducing the latency between document generation and delivery.",
        "Designed the concurrent processing strategy for distributed consumers running across multiple Kubernetes pods, implementing concurrency control with PostgreSQL advisory transaction locks to guarantee single processing of each logical execution and eliminate race conditions.",
        "Modeled the orchestration of executions composed of multiple documents, establishing completion rules, processing state handling, and an automated flow for file distribution.",
        "Integrated AWS S3 and Amazon RDS for storage, management, and automated distribution of financial documents.",
        "Developed solutions for risk platforms, integrating internal services with B3’s LiNe to support limit validation, risk monitoring, and operational workflows in the financial market.",
        "Optimized performance by evolving PostgreSQL queries and indexes, and implemented observability with Datadog and OpenSearch for production monitoring and diagnostics.",
      ],
      stack: btgStack,
    },
    {
      org: "Sinqia (Evertec)",
      role: "Senior Software Engineer / Tech Lead",
      period: "Jan 2018 — Jun 2023",
      bullets: [
        "Technical evolution of an investment management platform for investment banks, starting in product support and later moving into new feature development and technical leadership of the derivatives squad.",
        "Investigated and resolved incidents involving fixed income, structured notes (COE), swaps, derivatives, and equities operations, performing scenario analysis, business rule interpretation, log investigation, and production bug fixes.",
        "Developed and maintained ASP.NET applications (.NET Framework and later .NET Core), taking part in the platform’s gradual modernization toward more modern architectures.",
        "Optimized performance in SQL Server and Oracle, including execution plan analysis, index creation, and query improvements to support high-complexity financial operations.",
        "Developed solutions for the derivatives module, implementing features geared toward the financial market and supporting the product’s continuous evolution.",
        "Tech lead for the squad responsible for the derivatives module backlog, driving technical decisions, code reviews, refinements, and tracking the team’s development.",
        "Contributed to the evolution of the interest-bearing account platform using .NET Core 3, AKS, and SQL Server, working on distributed services and asynchronous, messaging-based processing.",
      ],
      stack: sinqiaStack,
    },
    {
      org: "Nestlé Brasil (TopMind)",
      period: "Dec 2016 — Dec 2017",
      bullets: ["Full-stack web application development using C# MVC, Entity Framework, JavaScript, HTML, and CSS."],
      stack: nestleStack,
    },
  ],
  education: [
    { course: "Technologist in Technology Management", where: "FATEC Mauá · 2018" },
    { course: "Technical Degree in Electronics", where: "ETEC Júlio de Mesquita · 2014" },
  ],
};

export const content: Record<Locale, Content> = { pt, en };
