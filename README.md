# Bruno Almeida

Site em React, Next.js App Router, TypeScript e Tailwind CSS v4.

## Desenvolvimento

Requer Node.js 20.9 ou superior.

```sh
npm install
npm run dev
```

Acesse http://localhost:3000.

## Verificação

```sh
npm run lint
npm run typecheck
npm run build
```

## Publicação

Projeto Next.js com servidor. Na Vercel, importe o repositório com o preset Next.js e os comandos padrão. Em outra hospedagem, rode `npm run build` e `npm start` em Node.js 20.9+.

Ao conectar um domínio próprio, defina `NEXT_PUBLIC_SITE_URL` com a URL HTTPS pública, sem barra final, e publique novamente para atualizar canonical, Open Graph e sitemap.

## Organização

- `app/`: rotas, layout, metadados, ícone e CSS global (tokens no bloco `@theme`).
- `components/`: seções e peças de UI.
- `lib/site-data.ts`: todo o conteúdo editável do site.
- `public/`: imagens e arquivos estáticos.
