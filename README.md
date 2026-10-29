# WebMart — Client

React 18 + TypeScript (strict) + Vite + Tailwind. Follows
[`reactcodingstandard.md`](./reactcodingstandard.md). Talks to the API in [`../server`](../server).

## Setup

```bash
cp .env.example .env   # set VITE_API_URL
npm install
npm run dev            # http://localhost:5173
```

Start the server first (see `../server/README.md`) and make sure its `CORS_ORIGINS` includes
`http://localhost:5173`.

| Variable       | Example                         | Notes                                        |
| -------------- | ------------------------------- | -------------------------------------------- |
| `VITE_API_URL` | `http://localhost:5000/api`     | Baked in at build time — never put secrets here |

| Script                 | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Dev server                              |
| `npm run build`        | Type-check, then production build       |
| `npm run preview`      | Serve the production build locally      |
| `npm run typecheck`    | `tsc --noEmit`                          |
| `npm run lint`         | ESLint (React, Hooks, a11y, TypeScript) |
| `npm run format`       | Prettier write                          |

## Pages

| Area      | Routes                                                                              |
| --------- | ----------------------------------------------------------------------------------- |
| Shop      | `/`, `/products`, `/products/:productId`, `/cart`, `/wishlist`, `/plus`              |
| Account   | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/profile`            |
| Checkout  | `/checkout/shipping` → `/checkout/payment` → `/checkout/review`                     |
| Orders    | `/orders`, `/orders/:orderId`                                                       |
| Info      | `/policies/:slug` (terms, privacy, refunds, shipping), `/contact`                   |
| Admin     | `/admin/products`, `/admin/users`, `/admin/orders`, `/admin/memberships`, `/admin/reports` |

## Features

- **Checkout** shows the server's price quote (first-order discount, reward points, tax, shipping),
  so the total on screen is exactly what Razorpay charges. Online payment via Razorpay Checkout,
  or cash on delivery.
- **Orders:** customers can cancel until shipped; refunds and their status appear on the order
  page. Admins ship, deliver, mark COD paid, refund and retry failed refunds.
- **Rewards:** points balance and history on the profile page; "Use my points" at checkout.
- **Wishlist, reviews, saved addresses and Plus membership.**

## Stack decisions

- **Routing:** `react-router-dom` with lazy-loaded routes and guards (`src/app/router`).
- **Server state:** TanStack Query; all HTTP goes through `src/lib/httpClient.ts`, which throws
  `ApiError` with the server's `status`, `code` and `details`.
- **Client state:** React context for auth and cart only; filters live in the URL.
- **Styling:** Tailwind CSS only. Brand colours are tokens in `tailwind.config.js` (`brand-*`).
  Repeated patterns are shared primitives in `src/components/ui`.

## Structure

```
src/
├── app/          # main, App, providers, router + guards, layout shell
├── features/     # auth, products, reviews, cart, checkout, orders, rewards, wishlist,
│   │             # addresses, membership, policies, admin
│   └── <feature>/ api/ components/ hooks/ pages/ utils/ types.ts index.ts
├── components/   # ui/ (Button, TextField, ConfirmDialog…), feedback/, layout/
├── lib/          # httpClient, queryClient, storage, session
├── types/        # truly shared types
├── utils/        # pure formatters
└── styles/
```

Features import each other only through their `index.ts`. Shared folders never import features.

## Deployment

`npm run build` outputs static files to `dist/`. Set `VITE_API_URL` to the deployed API
(`https://<your-api>/api`) **before** building, and add the client's URL to the server's
`CORS_ORIGINS`.

This is an SPA: the host must rewrite unknown paths to `/index.html` so deep links like
`/orders/123` work after a refresh (Vercel and Netlify do this with a single rewrite rule).
