# ADR-002 — Base de datos: PostgreSQL gestionado en Neon

## Decision

Usar **PostgreSQL gestionado en Neon** (endpoint pooled) como base de datos. Reemplaza la suposición de "PostgreSQL/MySQL en Namecheap" del brief, que resultó no ser el entorno real.

## Rationale

- El usuario proporcionó una instancia **Neon PostgreSQL** (validada: v18.6, DB `monedero`, SSL verificada, pooler transaccional OK, latencia ~100 ms, privilegios de migración OK).
- Neon es serverless-native y compatible con Vercel/serverless (pooling integrado, pgbouncer), mitigando el riesgo de conexiones en funciones serverless (R-002).
- PostgreSQL cumple ADR-009 del brief (motor preferido).

## Alternatives

- MySQL remoto: no disponible/necesario (ya existe PostgreSQL).
- Namecheap DB: no existe acceso real; descartado.
- BaaS: descartado (ADR-001).

## Impact

- Medio: cambia la referencia de infraestructura del brief (Namecheap → Neon).
- Las conexiones usan el endpoint pooled con `sslmode=require`; la credencial vive solo en `.env`/Vercel env vars.

## Status

ACEPTADA (validada técnicamente).