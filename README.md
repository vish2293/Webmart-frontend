# IndiaKart — Client

React 18 + TypeScript (strict) + Vite. Follows [`reactcodingstandard.md`](./reactcodingstandard.md).

## Setup

```bash
cp .env.example .env   # set VITE_API_URL
npm install
npm run dev
```

| Script              | Purpose                                 |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Dev server                              |
| `npm run build`     | Type-check, then production build       |
| `npm run typecheck` | `tsc --noEmit`                          |
| `npm run lint`      | ESLint (React, Hooks, a11y, TypeScript) |
| `npm run format`    | Prettier write                          |

## Stack decisions

- **Routing:** `react-router-dom` with lazy-loaded routes and guards (`src/app/router`).
- **Server state:** TanStack Query; all HTTP goes through `src/lib/httpClient.ts`.
- **Client state:** React context for auth and cart only; filters live in the URL.
- **Styling:** Tailwind CSS only. Brand colours are tokens in `tailwind.config.js` (`brand-*`).
  Repeated patterns are shared primitives in `src/components/ui`.

## Structure

```
src/
├── app/          # main, App, providers, router + guards, layout shell
├── features/     # auth, products, cart, checkout, orders, admin
│   └── <feature>/ api/ components/ hooks/ pages/ utils/ types.ts index.ts
├── components/   # ui/ (Button, TextField, ConfirmDialog…), feedback/ (Loading/Error/Empty)
├── lib/          # httpClient, queryClient, storage, session
├── types/        # truly shared types
├── utils/        # pure formatters
└── styles/
```

Features import each other only through their `index.ts`. Shared folders never import features.

## Deployment

This is an SPA: the host must rewrite unknown paths to `/index.html` so deep links like
`/orders/123` work after a refresh.
