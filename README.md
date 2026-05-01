# ProxyMarket

A production-ready Next.js 14 storefront for selling web proxy service licenses. Inspired by SellAuth — built with a real backend, real payments, and a design that doesn't suck.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL + Prisma ORM |
| Auth | Custom session-based (bcrypt + HTTP-only cookies) |
| Payments | Stripe (one-time + subscriptions) |
| Styling | Tailwind CSS + CSS variables |
| Animation | CSS keyframes + Framer Motion ready |
| Fonts | Syne (display) + Figtree (body) + JetBrains Mono |

---

## Features

- 🛒 **Full storefront** — product listings with type/billing filters
- 🔐 **Auth system** — register, login, sessions, middleware-protected routes
- 💳 **Stripe checkout** — one-time payments and subscriptions
- 🔑 **License key system** — auto-generated on payment, HWID binding, expiry
- 📊 **User dashboard** — view licenses, copy keys, order history
- 🛠️ **Admin panel** — revenue stats, recent orders, license overview
- 🌐 **Public verify API** — `POST /api/licenses/verify` for external integrations
- 🎨 **Unique design** — warm terracotta/ember palette, Syne display font, no generic cyberpunk

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/yourname/proxymarket
cd proxymarket
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in:
- `DATABASE_URL` — PostgreSQL connection string (Supabase, Neon, Railway all work)
- `NEXTAUTH_SECRET` — run `openssl rand -base64 32`
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — from Stripe dashboard
- `STRIPE_WEBHOOK_SECRET` — from `stripe listen --forward-to localhost:3000/api/webhook/stripe`

### 3. Set up database

```bash
npm run db:generate   # generate Prisma client
npm run db:push       # push schema to DB
npm run db:seed       # seed products + admin user
```

Seed creates:
- All 7 proxy products (Ultraviolet, Rammerhead, Meteor, WISP, Dynamic)
- Admin user: `admin@proxymarket.dev` / `admin1234`

### 4. Run dev server

```bash
npm run dev
```

### 5. Stripe webhooks (local)

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

---

## Project Structure

```
proxymarket/
├── prisma/
│   ├── schema.prisma          # Full data model
│   └── seed.ts                # Product + admin seed
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── products/          # Store / product listing
│   │   ├── checkout/          # Checkout flow + success
│   │   ├── dashboard/         # User + admin dashboards
│   │   ├── (auth)/            # Login + register
│   │   └── api/
│   │       ├── auth/          # login, register, logout
│   │       ├── orders/        # Create Stripe session
│   │       ├── products/      # Product listing API
│   │       ├── licenses/      # Public verify endpoint
│   │       └── webhook/       # Stripe webhook handler
│   ├── components/
│   │   └── layout/            # Navbar, Footer
│   ├── lib/
│   │   ├── db.ts              # Prisma singleton
│   │   ├── auth.ts            # Sessions, hashing, validation
│   │   ├── stripe.ts          # Stripe helpers
│   │   ├── license.ts         # Key gen, verify, HWID binding
│   │   └── utils.ts           # cn, formatCurrency, etc.
│   ├── types/index.ts         # Shared types + proxy metadata
│   └── middleware.ts          # Route protection
├── tailwind.config.ts
├── .env.example
└── package.json
```

---

## License Verify API

Public endpoint — usable from any client:

```http
POST /api/licenses/verify
Content-Type: application/json

{
  "key": "PXMKT-XXXXX-XXXXX-XXXXX-XXXXX",
  "hwid": "optional-hardware-id"
}
```

**Response (valid):**
```json
{
  "valid": true,
  "license": {
    "key": "PXMKT-...",
    "status": "ACTIVE",
    "product": "Ultraviolet Monthly",
    "expiresAt": "2025-06-01T00:00:00.000Z",
    "activationsLeft": 1
  }
}
```

**Response (invalid):**
```json
{
  "valid": false,
  "error": "License has expired"
}
```

---

## Adding Products

Edit `prisma/seed.ts` or insert directly:

```ts
await db.product.create({
  data: {
    slug: "ultraviolet-team",
    name: "Ultraviolet Team",
    proxyType: "ULTRAVIOLET",
    billingPeriod: "MONTHLY",
    price: 2999, // cents
    features: ["10 seats", "Team dashboard", "Priority support"],
    bandwidth: "Unlimited",
    connections: 25,
    speed: "10Gbps",
    regions: ["US", "EU", "ASIA"],
    isActive: true,
  }
})
```

---

## Deployment

**Recommended: Vercel + Neon (PostgreSQL)**

1. Push to GitHub
2. Import into Vercel
3. Add all env vars in Vercel dashboard
4. Add Stripe webhook endpoint: `https://yourdomain.com/api/webhook/stripe`
5. Run migrations: `npx prisma migrate deploy`

---

## Design System

**Colors:**
- `--ember` `#E8502A` — primary brand (terracotta/burnt orange)
- `--void` `#080809` — page background
- `--chalk` `#F0EEF8` — primary text
- `--dust` `#9896AA` — secondary text

**Fonts:**
- Display: `Syne` (headings, logo)
- Body: `Figtree` (UI, paragraphs)
- Mono: `JetBrains Mono` (keys, code)

---

## License

MIT — do whatever you want with it.
