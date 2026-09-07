# Stack

## Purpose

Definir el stack definitivo (propuesto en REQ-20260906-001, ADRs). Pendiente confirmación final del usuario.

## Relevant Information

| Capa | Tecnología | ADR |
| --- | --- | --- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript | ADR-001 |
| UI | Tailwind CSS, componentes propios, mobile-first | ADR-006 |
| Gráficas | Recharts | ADR-006 |
| Fechas | date-fns | ADR-006 |
| Estado servidor | TanStack Query v5 | ADR-006 |
| Formularios | React Hook Form + zod (esquemas compartidos) | ADR-006 |
| PWA | Serwist (@serwist/next): manifest + SW mínimo | ADR-006 |
| Backend/API | Route Handlers de Next.js (serverless en Vercel) | ADR-001 |
| Database | PostgreSQL gestionado en Neon (endpoint pooled, SSL) | ADR-002 |
| ORM / migraciones | Drizzle ORM + node-postgres + drizzle-kit | ADR-003 |
| Dinero | enteros en centavos (bigint) | ADR-004 |
| Auth | Auth.js (NextAuth v5) Credentials + bcrypt, sesión JWT httpOnly | ADR-005 |
| Testing | Vitest + React Testing Library + Playwright | ADR-007 |
| Package manager | npm (disponible en el entorno) | — |
| Node | v24.16.0 (local) | — |

## Rules

- No float para dinero.
- Validación server-side SIEMPRE (zod en API), no confiar solo en cliente.
- Secretos solo por variables de entorno.

## Notes

- Moneda/locale: **COP (Colombia)** con **es-CO**; sin decimales (formato `$ 10.000`), fechas `dd/mm/yyyy`. Variables: `CURRENCY_CODE=COP`, `LOCALE=es-CO`.