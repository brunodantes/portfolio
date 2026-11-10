<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Bruno Almeida

Next.js (App Router) + React 19 + TypeScript + Tailwind CSS v4. Sem biblioteca de UI; ícones via `lucide-react`.

## Convenções

- **Conteúdo em dados**: textos, links e listas ficam em `lib/site-data.ts`, nos dois idiomas (`content.pt` / `content.en`). Componentes só leem esses dados; para editar copy, altere o arquivo de dados nas duas línguas.
- **Idioma e movimento**: preferências do visitante em `lib/preferences.ts` (`useContent()`, `usePreferences()`, `setPreferences()`), salvas no `localStorage`. O HTML estático sai em PT. Uma URL só, com botão PT/EN (decisão D4 do `PLANO.md`).
- **Paleta**: "Phosphor" (escolhida; a B "Dunkode" foi descartada), definida por `--p-*` em `app/globals.css` e espelhada em `lib/palette.ts` para as cenas 3D. Componentes usam só os nomes semânticos do `@theme` (`bg-surface`, `text-accent-text`, `border-line`…), nunca hex solto.
- **Fontes**: `next/font/google` em `app/layout.tsx`: Michroma (`font-display`, títulos em caixa alta), Sora (`font-sans`) e JetBrains Mono (`font-mono`, só para valores técnicos: períodos, tags, níveis).
- **Componentes**: peças de UI em `components/ui/` (HudPanel, Tag, XpBar, FxButton…), seções da página em `components/sections/`. As seções são client components porque leem o idioma escolhido.
- **Movimento**: tudo que anima respeita `data-motion="off"` (switch "Movimento" no contato) e "reduzir movimento" do sistema.
- **Cenas 3D**: ficam em `components/three/<cena>/`, carregadas com `next/dynamic` (`ssr: false`), e seguem as skills `r3f-*` de `.claude/skills/`. O ESLint desliga `react-hooks/immutability`, `purity` e `use-memo` só em `components/three/**` e `components/worlds/**`, porque mutar objetos do Three.js no `useFrame` é o padrão do R3F. Toda cena precisa de alternativa sem WebGL e com "reduzir movimento".
- **Plano do projeto**: `PLANO.md` (fases, decisões e checklist).
- **Acessibilidade**: link "pular para o conteúdo", `aria-expanded` no menu, Esc fecha o menu, foco visível, links externos com `rel="noopener noreferrer"`.

## Comandos

```sh
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```
