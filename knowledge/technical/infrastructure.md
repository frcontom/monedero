# Infrastructure

## Purpose

Definir la infraestructura y su estado de validación.

## Relevant Information

- **Database**: Neon PostgreSQL (ADR-002). Validado: v18.6, DB `monedero`, SSL OK, pooler transaccional OK, latencia ~100 ms, permisos de migración OK. Credencial en `.env` (gitignored) y Vercel env vars.
- **Deployment**: Vercel (Next.js). Proyecto confirmado por el usuario: dominio **`https://monedero-seven.vercel.app/`** (proyecto `monedero-seven`). Vinculación final en TASK-018. Sin CLI/token local.
- **Git**: `github.com/frcontom/monedero` (branch `main`).
- **Local**: Node v24.16.0, npm 11.13.0, pnpm 11.17.0, git 2.55.0. Red OK.
- Variables de entorno necesarias:
  - `DATABASE_URL` (Neon pooled, sslmode=require) — server-only.
  - `AUTH_SECRET` (Auth.js) — server-only.
  - `CURRENCY_CODE=COP`, `LOCALE=es-CO` — formateo (publica).
- Sin `.gitignore` todavía → crear en TASK-003 para proteger `.env*`, `node_modules`, `.next`.

## Rules

- Secretos únicamente en variables de entorno (nunca en Git ni en el expediente).
- DB accesible solo desde el backend (nunca desde el navegador).
- HTTPS en producción.

## Notes

- La suposición "Namecheap" del brief queda obsoleta → Neon (ADR-002).
- Moneda/locale: COP / es-CO (sin decimales).