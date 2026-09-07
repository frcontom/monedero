# Database

## Purpose

Definir el modelo de datos (propuesta REQ-20260906-001, ADR-002/003/004).

## Relevant Information

- Motor: PostgreSQL 18.6 gestionado en Neon, endpoint pooled, SSL.
- ORM: Drizzle; migraciones con drizzle-kit.
- Dinero: `bigint` en centavos (ADR-004).
- Tablas conceptuales:
  - `users`: id (uuid), email único, password_hash, created_at.
  - `goals`: id, user_id (FK), name, description (null), target_amount_cents (bigint > 0), start_date (date), date_mode (TARGET_DATE|NO_DATE), target_date (date null), planning_mode (PERIODIC|FLEXIBLE), periodicity (DAILY|WEEKLY|MONTHLY null), planned_amount_cents (bigint null), status (ACTIVE|PAUSED|COMPLETED|CANCELLED), category (enum), created_at, updated_at.
  - `goal_movements`: id, goal_id (FK), date (date), type (deposit|withdrawal), amount_cents (bigint > 0), description (null), created_at, updated_at.
- Constraints clave: target_amount_cents > 0; si date_mode=TARGET_DATE → target_date ≥ start_date (check); si planning_mode=PERIODIC → periodicity y planned_amount_cents NOT NULL; amount_cents ≥ 0.
- Índices: goals(user_id), goal_movements(goal_id, date).
- Los cálculos (acumulado, progreso, proyección) se derivan de movimientos; no se almacenan duplicados.
- Metas no se borran físicamente (CANCELADA); movimientos sí editables/eliminables (ver `knowledge/domain/goals.md` §7).

## Rules

- No float para dinero.
- Migraciones versionadas en `drizzle/`.
- Integridad referencial con FK; estrategia de archivado = soft cancel.

## Notes

- Validada conectividad SSL + transacciones sobre el pooler.