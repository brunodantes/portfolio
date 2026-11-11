<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Bruno Almeida

Next.js (App Router) + React 19 + TypeScript + Tailwind CSS v4. Sem biblioteca de UI; ícones via `lucide-react`.

## Convenções

- **Página única**: `app/page.tsx` renderiza a sala tática (`components/mission/MissionPage.tsx`). Não há outras rotas além do 404, da imagem de compartilhamento, do sitemap e do robots.
- **Conteúdo em dados**: textos, experiências, conquistas, stack e contatos ficam em `lib/site-data.ts`, nos dois idiomas (`content.pt` / `content.en`). Componentes só leem esses dados; ao editar copy, altere as duas línguas.
- **Capítulos**: briefing (perfil e formação), as experiências em ordem cronológica, capacidades e contato (`components/mission/chapters.ts`). A cena tem uma operação por capítulo depois do briefing (`components/mission/tatico/layout.ts`); ao mudar um, mude o outro.
- **Idioma e movimento**: preferências do visitante em `lib/preferences.ts` (`useContent()`, `usePreferences()`, `setPreferences()`), salvas no `localStorage`. O HTML estático sai em PT; uma URL só, com botão PT/EN.
- **Cores**: tokens `--p-*` em `app/globals.css`, expostos no `@theme` (`bg-surface`, `text-accent`, `bg-signal`…). Ciano (`accent`) para a interface, âmbar (`signal`) para a rota, a unidade e as ações. Nunca hex solto nos componentes; a cena 3D espelha as cores em constantes no topo de `TaticoScene.tsx`.
- **Fontes**: `next/font/google` em `app/layout.tsx`: Oxanium (`font-display`), IBM Plex Sans (`font-sans`) e Share Tech Mono (`font-mono`, só para telemetria: códigos, períodos, níveis).
- **Cena 3D**: React Three Fiber, carregada com `next/dynamic` (`ssr: false`), seguindo as skills `r3f-*` de `.claude/skills/`. Nada de setState no `useFrame`; animação por refs e amortecimento por `delta`. O ESLint desliga `react-hooks/immutability`, `purity` e `use-memo` só em `components/mission/**`. Sem WebGL, aparece um fundo estático; com movimento desligado, a câmera corta entre capítulos e a cena para.
- **Cartões**: nunca mais altos que a tela (rolam por dentro, com `data-lenis-prevent`). Os inativos ficam invisíveis e sem clique, mas reaparecem ao receber foco pelo teclado.
- **Plano do projeto**: `PLANO.md` (decisões e checklist).
- **Acessibilidade**: link "pular para o conteúdo", um `h1`, foco visível em âmbar, links externos com `rel="noopener noreferrer"`, cena com `aria-hidden`.

## Comandos

```sh
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
npm run test:e2e   # Playwright contra o build
```
