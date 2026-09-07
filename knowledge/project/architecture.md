# Architecture

## Purpose

Definir la arquitectura del sistema monedero (propuesta REQ-20260906-001).

## Relevant Information

```text
Usuario (móvil/desktop)
   |
   v
Next.js (App Router) — Frontend + PWA + Route Handlers (API)
   |                        |
   |   (server-side only)   |
   v                        v
  Auth (Auth.js JWT)      Drizzle ORM / node-postgres
   |                        |
   v                        v
  Neon PostgreSQL (pooled, SSL)  ← credenciales solo en env vars
```

- Un solo proyecto Next.js desplegado en Vercel (frontend + funciones serverless).
- Cálculos de progreso/proyección/disciplina: módulos puros en `lib/calc` o `server/` (TS), usados por las APIs; nunca duplicados en cliente sin reutilización.
- Separación lógica por `user_id` en todas las consultas.
- Estructura prevista:
  - `app/` (rutas: `(auth)/login`, dashboard, metas, journal, analitica, configuracion; `api/*`).
  - `components/` (UI, modales, gráficas, calendario).
  - `lib/` (db, auth, validators, money, calc).
  - `drizzle/` (esquema y migraciones).
  - `tests/` (unit, e2e).

## Rules

- No exponer la DB al navegador.
- Sin microservicios/colas/Redis/Kafka.
- Los valores calculados no se almacenan duplicados: se derivan de movimientos (ver `knowledge/domain/goals.md`).

## Notes

- Validada la conectividad serverless → Neon (pooler, ~100 ms).