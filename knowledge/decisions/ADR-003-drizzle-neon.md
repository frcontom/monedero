# ADR-003 — Acceso a datos: Drizzle ORM + node-postgres + drizzle-kit

## Decision

Usar **Drizzle ORM** con adapter `node-postgres` (pg Pool) para acceso a datos, y **drizzle-kit** para migraciones. Esquema tipado TS compartido.

## Rationale

- Drizzle es ligero, TS-first y SQL-cercano (sin "magia"), ideal para serverless y para mantener control sobre consultas analíticas.
- `node-postgres` fue validado contra el endpoint pooled de Neon (transacciones OK, SSL OK).
- Las migraciones son versionadas y aplicables desde el entorno de despliegue.

## Alternatives

- Prisma: más cómodo para migraciones iniciales pero más pesado en runtime serverless y menos control SQL.
- Driver `@neondatabase/serverless` HTTP: más rápido en cold start pero transacciones más limitadas; no necesario ahora.

## Impact

- Bajo-medio: fija la capa de datos y el formato de migraciones.
- Dinero como `bigint` (centavos) — ver ADR-004.

## Status

PROPUESTA (pendiente confirmación).