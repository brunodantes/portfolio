# Bruno Almeida · Portfólio

Portfólio em forma de **sala tática**: uma mesa holográfica 3D em que cada experiência profissional é uma
operação no mapa. O scroll leva a câmera de operação em operação, a rota se acende e os cartões trazem
objetivos cumpridos, resultados e o equipamento usado.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · React Three Fiber.

## Desenvolvimento

Requer Node.js 20.9 ou superior.

```sh
npm install
npm run dev        # http://localhost:3000
```

## Verificação

```sh
npm run lint
npm run typecheck
npm run build
npm run test:e2e   # Playwright contra o build (1ª vez: npx playwright install chromium)
```

O GitHub Actions (`.github/workflows/ci.yml`) roda tudo isso em cada pull request e push na `master`.

## Onde editar

| O quê | Onde |
| --- | --- |
| Textos, experiências, conquistas, stack, contatos (PT e EN) | `lib/site-data.ts` |
| Posição das operações e etiquetas da mesa | `components/mission/tatico/layout.ts` |
| Cores e fontes | `app/globals.css` (tokens) e `app/layout.tsx` (fontes) |
| Aparência dos cartões e do HUD | `components/mission/tatico/config.tsx` |
| Currículos em PDF | `public/resume/` |

## Organização

- `app/`: página única, layout, metadados, 404, imagem de compartilhamento (`opengraph-image.tsx`), sitemap e robots.
- `components/mission/`: o motor da experiência. `WorldShell` (cena fixa + capítulos que rolam por cima),
  `CameraRig` (câmera por pontos-chave), `GameChapter` (conteúdo de cada capítulo), `GameHud` (nível, XP e minimapa)
  e `WorldHud` (barra do topo e índice).
- `components/mission/tatico/`: a cena da mesa (`TaticoScene.tsx`), o layout das operações e o tema.
- `lib/`: conteúdo, tipos, preferências do visitante (idioma e movimento) e detecção do aparelho.
- `tests/`: testes de fumaça (Playwright, desktop e celular).

## Publicação

Projeto Next.js com servidor. Na Vercel, importe o repositório com o preset Next.js e os comandos padrão.
Ao conectar o domínio, defina `NEXT_PUBLIC_SITE_URL` com a URL HTTPS pública (sem barra final) e publique de novo
para atualizar canonical, Open Graph, JSON-LD e sitemap.
