# Control Financiero

Proyecto UI profesional pensado para Next.js + PostgreSQL con datos estructurados y componentes reutilizables.

## Estructura clave

- `app/`: páginas principales (`/`, `/transactions`, `/budgets`, `/debts`)
- `components/`: layout y UI reutilizable
- `lib/prisma.ts`: cliente Prisma
- `prisma/schema.prisma`: modelo de datos PostgreSQL
- `app/api/transactions/route.ts`: ejemplo de endpoint API

## Comandos

```bash
npm install
npm run dev
```

## Base de datos

Ajusta `DATABASE_URL` en un archivo `.env` y ejecuta:

```bash
npx prisma migrate dev --name init
npx prisma generate
npm run seed
```

## Recomendaciones

- Usa `Prisma` para modelar `users`, `accounts`, `transactions`, `categories`, `budgets`, `debts`
- Mantén la UI modular con `AppShell`, `Sidebar`, `Topbar` y componentes de datos
- Implementa API routes para las operaciones de CRUD
