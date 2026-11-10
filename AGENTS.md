<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Bruno Almeida

Next.js (App Router) + React 19 + TypeScript + Tailwind CSS v4. Sem biblioteca de UI; ícones via `lucide-react`.

## Convenções

- **Conteúdo em dados**: textos, links, listas e contatos ficam em `lib/site-data.ts`. Componentes só leem esses dados; para editar copy, altere o arquivo de dados.
- **Tokens visuais**: cores e fontes ficam no bloco `@theme` de `app/globals.css` (`bg-paper`, `text-ink`, `text-accent`…). Não use cores hex soltas nos componentes.
- **Fontes**: carregadas com `next/font/google` em `app/layout.tsx` e expostas como `--font-display-face` / `--font-sans-face`.
- **Server Components por padrão**: use `"use client"` apenas em componentes com estado ou eventos (Header, Faq, Reveal).
- **Animação de entrada**: envolva seções em `<Reveal>`. O CSS só esconde o conteúdo quando há JavaScript e sem "reduzir movimento".
- **Imagens ausentes**: use `<Placeholder label="…" />` até receber o asset final; depois troque por `next/image` com arquivos em `public/`.
- **Cenas 3D**: ficam em `components/three/<cena>/`, carregadas com `next/dynamic` (`ssr: false`), e seguem as skills `r3f-*` de `.claude/skills/`. O ESLint desliga `react-hooks/immutability`, `purity` e `use-memo` só em `components/three/**`, porque mutar objetos do Three.js no `useFrame` é o padrão do R3F. Toda cena precisa de alternativa sem WebGL e com "reduzir movimento".
- **Plano do projeto**: `PLANO.md` (fases, decisões e checklist).
- **Acessibilidade**: link "pular para o conteúdo", `aria-expanded` no menu, Esc fecha o menu, foco visível, links externos com `rel="noopener noreferrer"`.

## Comandos

```sh
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```
