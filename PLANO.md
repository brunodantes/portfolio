# Plano — Portfólio 2.0 (Next.js + 3D)

Evoluir o portfólio atual (Vite + React 19 em JSX, `app/`) para um produto Next.js no mesmo padrão do `dunkode-site`:
Next 16 App Router + TypeScript + Tailwind v4 + React Three Fiber, com animação 3D guiada pelo scroll e duas paletas em comparação.

Ao concluir um item, marque `[x]`.

---

## 1. Diagnóstico do projeto atual

**O que existe e será reaproveitado**

| Item | Onde | Destino no Next |
| --- | --- | --- |
| Conteúdo PT/EN completo (perfil, stats, skills, stack, 4 experiências, formação) | `app/src/data.js` | `lib/site-data.ts` tipado |
| Design system "HUD de jogo" (tokens de cor, tipo, efeitos, motion) | `app/src/styles/tokens/*.css` | bloco `@theme` em `app/globals.css` |
| ~20 componentes (HudPanel, XpBar, StatReadout, Tag, Badge, Card, TiltCard, Marquee, TypedLines, CursorHalo, CodeBackdrop…) | `app/src/components/` | portar para TSX + Tailwind |
| 18 ícones de tecnologia + 25 ícones de UI em SVG | `app/public/assets/icons/` | ícones de tech viram **logos 3D extrudados**; os de UI viram `lucide-react` |
| Currículos PT/EN em PDF, `og-preview.png` | `app/public/` | `public/` |
| Rádio (player do YouTube) | `components/RadioPlayer.jsx` | **removido** (D5) |
| Metadados OG/Twitter | `app/index.html` | `metadata` do layout + `app/opengraph-image.tsx` |

**O que vem do Dunkode (copiar e adaptar, não reescrever)**

- Skills `r3f-*` (11) de `dunkode-site/.claude/skills/` → `portfolio/.claude/skills/`.
- `lib/device.ts` (WebGL + aparelho modesto), `lib/use-reduced-motion.ts`, `SmoothScroll` (Lenis), `Reveal`, `FxButton`.
- `components/three/stage/Stage.tsx` (monta só perto da tela, pausa fora dela, fallback sem WebGL).
- Padrão da **jornada** (`three/journey/`: canvas fixo transparente + vagas `data-ball-slot` + store sem re-render).
- Padrão de **conceitos** (`/conceitos/[variant]`, `noindex`, fora do sitemap) e `IntroLoader`.
- `next.config.mjs` com cabeçalhos de segurança, Playwright, CI do GitHub Actions, Analytics + Speed Insights.
- Mesmas versões: next 16.4.3, react 19.2.8, three 0.187, @react-three/fiber 9.8, drei 10.7, postprocessing, lenis.

**Problemas encontrados (corrigir na migração)**

- [x] **Datas divergentes entre PT e EN** em `data.js`. Confirmadas: Itaú `Mar 2026 — Atual`, BTG `Jun 2023 — Mar 2026`, Sinqia `Jan 2018 — Jun 2023`, Nestlé `Dez 2016 — Dez 2017`. Aplicar nas duas línguas.
- [x] **Bullets divergentes na BTG**. Confirmado: o certo é **S3 + RDS** (corrigir o EN, que diz SES), e o item "Modeled the orchestration of executions…" entra também no PT: "Modelagem da orquestração de execuções compostas por múltiplos documentos, com regras de conclusão, controle de estado do processamento e fluxo automatizado de distribuição dos arquivos."
- [ ] **Deploy quebrado/indefinido**: o canonical aponta para `brunodantes.github.io/portifolio/`, mas não há workflow de Pages e o Vite não tem `base: '/portifolio/'` (os assets em `/assets/...` quebrariam num subcaminho).
- [x] **Dois clones**: este (`~/Github/Repos/portfolio`, remoto `brunodantes/portfolio`) é o oficial. O clone antigo `~/Github/Repos/portifolio` foi para a lixeira.
- [x] **Tema claro/escuro em andamento** (não commitado): `app/src/context/ThemeContext.jsx`, botão Light/Dark no `App.jsx` e mudanças em `colors.css`. Decisão: **descartar**. O site novo é só escuro, com as paletas A/B.
- [x] Idioma por estado React (`useState('pt')`). Decisão: **manter o botão PT/EN** numa URL só (só o PT é indexado pelo Google); lembrar a escolha no `localStorage`.

---

## 2. Conceito criativo 3D

**Tema central:** "sistemas que não param". O Bruno constrói sistemas distribuídos e de alta disponibilidade para o mercado financeiro, tem formação técnica em eletrônica, e o site atual já usa a linguagem de **personagem de jogo** (LV 09, ficha do personagem, barras de XP, "equipamento"). O 3D junta essas três ideias.

**Fio condutor (a "bola" do Dunkode):** um **pacote de dados**, um cubo/esfera luminosa, atravessa a página como uma mensagem passando por uma arquitetura orientada a eventos. Cada seção é um "serviço" que recebe, processa e reenvia o pacote.

### Três direções para o hero (comparadas em `/conceitos/<slug>`)

| # | Slug | Conceito | Interação |
| - | --- | --- | --- |
| 1 | `cluster` | **Malha distribuída.** Nós (pods/serviços) ligados por arestas; mensagens correm como partículas (RabbitMQ). Com o scroll, a malha se organiza do caos até a arquitetura e o nome "Bruno Almeida" se forma no centro. | Mouse perturba os nós; clique num nó dispara um "evento" que se propaga em onda. |
| 2 | `chip` | **Placa de circuito.** Um processador 3D em perspectiva (aceno à eletrônica da ETEC); as trilhas acendem e levam pulsos até o chip. O scroll faz a câmera mergulhar no die, onde o silício vira linhas de código C#. | Parallax da câmera com o mouse; hover acende trilhas. |
| 3 | `player` | **Seleção de personagem.** Um card holográfico do "player" gira no centro com stats orbitando como painéis HUD, num grid neon infinito (estilo synthwave/arcade). | Arrastar gira o card; os stats encaixam no lugar com o scroll. |

### 3D nas outras seções (uma interação principal por seção)

- [ ] **Trajetória → pipeline.** As 4 empresas viram estações num trilho 3D (Nestlé → Sinqia → BTG → Itaú). O pacote percorre o trilho pelo scroll; a estação em foco acende e abre o card da experiência. O Itaú pulsa como "atual".
- [ ] **Stack → órbita de tecnologias.** Os 18 SVGs de tech viram tokens 3D extrudados (`SVGLoader` + `ExtrudeGeometry`) orbitando um núcleo. As barras de XP viram anéis de progresso que "carregam" ao entrar na tela. Hover num grupo (Backend, Cloud…) traz as suas tecnologias para a frente.
- [ ] **Contato → handshake.** O pacote chega ao destino: animação de `SYN → SYN-ACK → ACK` e os canais (LinkedIn, GitHub, telefone, currículo) "conectam" um a um.
- [ ] **Intro loader → boot sequence.** Linhas de terminal + contador, e o pacote é "compilado" (reaproveita `IntroLoader`).
- [ ] **404 → `504 Gateway Timeout`.** O pacote se perde, tenta de novo com backoff exponencial (piada com Polly) e o clique leva de volta para a home.
- [ ] **Fundo global**: manter o `CodeBackdrop` (código .NET rolando) em 2D, bem sutil, atrás do canvas.

### Duas paletas (escolher depois)

Implementadas como tema por `data-theme` no `<html>`, com tokens CSS **e** um `lib/palette.ts` que as cenas 3D leem (materiais, luzes, bloom). Alternância por `?theme=` e por um seletor na barra de conceitos.

| Token | A · "Phosphor" (atual) | B · "Dunkode" |
| --- | --- | --- |
| Fundo | `#08090C` / `#0C0D10` carbono | `#0b1020` night / `#121830` surface |
| Acento | `#3BE87F` verde fósforo | `#8b5cf6` violeta |
| Secundária | `#38E1FF` ciano telemetria | `#c4b5fd` lavanda |
| Texto | `#ECF1F0` | `#f7f8fc` snow / `#c9ccda` body |
| Fontes | Michroma + Sora + JetBrains Mono (as mesmas nas duas, para comparar só a cor) | idem |

Combinações a avaliar: 3 heroes × 2 paletas = 6 prévias. Sugestão: decidir primeiro a paleta com o hero 1 pronto e só então montar os heroes 2 e 3.

---

## 3. Decisões (respondidas em 2026-11-10)

Paleta final: **A "Phosphor"** (escolhida na fase 4).

| # | Decisão | Escolha |
| - | --- | --- |
| D1 | Estrutura do repositório | Next.js na **raiz** do repositório, no lugar de `app/` (igual ao Dunkode). O site Vite fica no histórico do git. Branch `feat/next-3d`. |
| D2 | Hospedagem | **Vercel** (preview por branch, Analytics, OG dinâmico, cabeçalhos). |
| D3 | Domínio | **Subdomínio da Vercel** (`*.vercel.app`) por enquanto; domínio próprio depois, trocando só `NEXT_PUBLIC_SITE_URL`. |
| D4 | Idiomas | **Botão PT/EN como hoje**, numa URL só; conteúdo por idioma em `lib/site-data.ts`. |
| D5 | Rádio | **Remover.** |
| D6 | Páginas extras | **Página única com âncoras.** `/cases` (Necton Portal, LiNe/B3, calculadora sucessória) fica para depois. |
| D7 | Datas e bullets | Confirmadas (ver diagnóstico). |
| D8 | Tema claro/escuro em andamento | **Descartar.** |

---

## 4. Plano de execução

### Fase 0 · Preparação
- [x] Descartar o tema claro/escuro em andamento e criar a branch `feat/next-3d`.
- [x] Copiar as skills `r3f-*` do Dunkode para `.claude/skills/`.
- [x] Confirmar as decisões D1–D8.

### Fase 1 · Scaffold Next.js (skill `nextjs-site-init`)
- [x] Next 16 + React 19 + TS + Tailwind v4 na raiz; `AGENTS.md`/`CLAUDE.md` com as convenções do Dunkode (conteúdo em dados, tokens no `@theme`, Server Components por padrão).
- [x] Dependências 3D com as mesmas versões do Dunkode; build com `--webpack` se a hospedagem exigir.
- [x] Mover `public/` (ícones, currículos, og) e apagar `app/` (Vite).
- [x] `next.config.mjs` com cabeçalhos de segurança.

### Fase 2 · Conteúdo e design system
- [x] `lib/site-data.ts` tipado (`lib/types.ts`) a partir de `data.js`, com as datas corrigidas.
- [x] Página única com seletor PT/EN (lembrado no `localStorage`, `lang` do `<html>` atualizado); `metadata`, `sitemap.ts` e `robots.ts` em PT.
- [x] Tokens das duas paletas em `globals.css` + `lib/palette.ts`; fontes via `next/font/google`.
- [x] Portar componentes: HudPanel, Card, Tag, Badge, StatReadout, XpBar, SectionHeading, TopNav, Marquee, TypedLines, CursorHalo, CodeBackdrop. Trocar o `Button` pelo `FxButton` do Dunkode.
- [x] Seções em 2D funcionando de ponta a ponta (Hero, Trajetória, Stack, Contato, Footer). **Marco: o site novo já substitui o atual sem 3D.**

### Fase 3 · Infra 3D (copiada do Dunkode)
- [x] `device.ts`, `SmoothScroll` (Lenis) e `Stage`. O "reduzir movimento" vem do `usePreferences().motion` (switch do site + sistema); `Reveal` não foi usado.
- [x] Progresso do scroll por ref + variável CSS `--p` (sem re-render); cenas via `next/dynamic` com `ssr: false`.
- [x] Rota `/conceitos/[variant]` com seletor de hero **e** de paleta.
- [x] Componente `Packet` compartilhado (o pacote de dados) em `components/three/shared/`, com prévia em `/conceitos/pacote`. As cores 3D vêm de `lib/palette.ts` (`usePalette()`), trocando ao vivo com a paleta.

### Fase 4 · Hero 1 (`cluster`) nas duas paletas
- [x] Malha de nós instanciada (`InstancedMesh`), 72 mensagens correndo pelas arestas camada a camada (borda → APIs → serviços → broker → workers → dados), bloom. O cursor afasta os nós e o clique dispara uma onda de "evento". `components/three/cluster/`.
- [x] Coreografia do scroll: caos → arquitetura, com o fecho "Do caos à arquitetura." em HTML (no lugar do nome formado em 3D). No celular a arquitetura gira 90° e as camadas descem; com movimento desligado, já aparece organizada ao lado do texto.
- [x] Efeitos 3D reforçados (pedido do Bruno: "faltou efeitos em 3D"): nós de vidro iluminados com núcleo aceso, luzes coloridas orbitando, câmera que mergulha na malha e acompanha o mouse, mensagens como rastros de luz, poeira digital em profundidade, neblina, bloom e aberração cromática pulsando no clique.
- [x] **Marco: paleta escolhida — A "Phosphor"** (10/11/2026). A paleta B e o seletor foram removidos do código.

### Fase 5 · Jornada do pacote + seções 3D
- [ ] Canvas fixo transparente + vagas `data-packet-slot` (`entry`, `pipeline`, `orbit`, `handshake`).
- [ ] Trajetória (pipeline), Stack (órbita de logos extrudados + anéis de XP), Contato (handshake).
- [ ] Intro loader "boot" e 404 "504".

### Fase 6 · Heroes 2 e 3
- [ ] `chip` e `player` em `/conceitos/`. **Marco: escolher o hero final**, definir `siteConfig.heroVariant` e apagar os conceitos descartados.

### Fase 7 · Acabamento e SEO
- [ ] `app/opengraph-image.tsx` (nome + cargo + visual do hero na paleta escolhida).
- [ ] JSON-LD `Person` (cargo, `sameAs` LinkedIn/GitHub, `knowsAbout` com a stack).
- [ ] Vercel Analytics + Speed Insights; eventos (download do currículo, clique no LinkedIn).

### Fase 8 · Qualidade
- [ ] Fallback sem WebGL e com "reduzir movimento" em todas as cenas (testar com o Chrome sem 3D).
- [ ] Lighthouse mobile ≥ 85; medir o bundle do three e adiar o 3D para depois do LCP.
- [ ] Playwright (desktop e celular: troca PT/EN, 404, links, currículo) + CI do GitHub Actions (lint, typecheck, build, e2e).
- [ ] Teclado, leitor de tela e contraste nas duas paletas.

### Fase 9 · Publicação
- [ ] Projeto na Vercel, preview por branch e `NEXT_PUBLIC_SITE_URL` com o endereço `*.vercel.app`.
- [ ] Atualizar o canonical e os links do LinkedIn/currículo para o novo domínio; desligar o GitHub Pages antigo, se existir.
- [ ] Juntar `feat/next-3d` na `master` só depois do preview aprovado.

---

## Rodada 2 · Mundos 3D do zero (branch `feat/mundos-3d`)

Pedido do Bruno (10/11/2026): recomeçar o site do zero, todo em 3D, sem seguir o modelo atual, e comparar protótipos.
O site atual continua em `/` (grupo `app/(classico)`); os mundos ficam em `/mundos/<slug>` (noindex), com o mesmo conteúdo.

- [x] Motor comum (`components/worlds/engine/`): canvas fixo em tela cheia, capítulos em HTML (início, origem, empresas em ordem cronológica, stack, contato), câmera por pontos-chave que estaciona em cada capítulo, HUD com idioma, movimento, currículo e troca de mundo.
- [x] `/mundos/placa`: Placa de circuito. Chips por empresa, pulso de sinal acendendo as trilhas, capacitores como skills, conector de borda como contato.
- [x] `/mundos/mercado`: Livro de ofertas. Gráfico de candles que se desenha com o scroll, rompimentos por empresa, média móvel, painel de cotações, livro de ofertas da stack.
- [x] `/mundos/datacenter`: Sala de controle. Corredor de racks com LEDs, piso refletindo, servidor ejetado por empresa, lanterna no mouse, patch panel e terminal.
- [x] `/mundos/jogo`: Mundo do jogo. Arquipélago de ilhas flutuantes, personagem-cubo pulando pelo caminho e pegando moedas, ilha de inventário e portal "Continue?", desfoque de maquete.
- [ ] **Marco: escolher o mundo** (ou combinar ideias de mais de um). Depois: levar o escolhido para `/`, apagar os outros e retomar as fases 7–9 (SEO, qualidade, publicação).

## Rodada 3 · Jogo com tom sério (pedido do Bruno: manter o mundo do jogo, mais sério)

- [x] Interface de jogo comum (missões, conquistas, XP/nível, árvore de habilidades, minimapa).
- [x] `/mundos/estrategia`: arquipélago noturno com névoa de guerra e unidade de cristal.
- [x] `/mundos/tatico`: mesa holográfica de operações (relevo em curvas de nível, rota de briefing, radar da stack).
- [x] `/mundos/orbital`: mapa orbital (empresas como planetas/estações, nave em transferência, constelação da stack, portal de dobra).
- [x] `/mundos/reino`: RPG medieval (pedido do Bruno). Reino ao anoitecer; cada experiência é um monumento (forja, moinho, torre da guilda, fortaleza, cidadela, círculo rúnico, quadro de missões); a câmera para de frente para cada fachada; os cartões alternam de lado e entram deslizando.
- [ ] **Marco: escolher entre Ilhas (original), Estratégia, Sala tática, Mapa orbital e Reino** (ou combinar). Depois: levar o escolhido para `/`, apagar os mundos e conceitos descartados e retomar as fases 7–9.
