# Backend

## Purpose

Definir la capa backend/API (propuesta REQ-20260906-001, ADR-001/003/005).

## Relevant Information

- API = Route Handlers de Next.js (`app/api/**/route.ts`), runtime nodejs (por defecto), serverless en Vercel.
- Conjuntos conceptuales de endpoints (contratos a detallar en TASK-002):
  - Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/session`.
  - Goals: `GET/POST /api/goals`, `GET/PATCH/DELETE /api/goals/[id]`, `POST /api/goals/[id]/status`.
  - Movements: `GET/POST /api/goals/[id]/movements`, `PATCH/DELETE /api/goals/[id]/movements/[mid]`.
  - Analytics/Projection: `GET /api/dashboard`, `GET /api/goals/[id]/projection`, `GET /api/goals/[id]/analytics`.
- Autenticación: Auth.js v5 (Credentials) + bcrypt; sesión JWT en cookie httpOnly; `auth()`/middleware protege rutas y APIs.
- Validación server-side con zod (esquemas compartidos) en TODA API.
- Manejo de errores: respuestas JSON tipadas; sin filtrar detalles internos; nunca loguear secretos.
- Rate limiting simple en login (intentos en memoria).

## Rules

- Toda consulta filtra por `user_id` (authorization).
- Dinero como enteros en centavos en los contratos.
- CSRF gestionado por Auth.js en sus endpoints; para el resto, usar sesión httpOnly + SameSite.

## Notes

- Conexión DB con `pg` Pool + SSL (`sslmode=require`) hacia el endpoint pooled de Neon.