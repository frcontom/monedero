# API CONTRACTS — monedero

> TASK-002 / REQ-20260906-001. Contratos de la capa API (Route Handlers de Next.js). Base relativa `/api`. Autenticación vía cookie de sesión (Auth.js). Formato fechas: `YYYY-MM-DD`. Dinero: **enteros (COP, pesos)**. Errores: `{ "error": { "code": string, "message": string } }`.

## Autenticación (rutas Auth.js v5)

- `POST /api/auth/login` — body `{ email, password }` → `200 { user }` | `401`.
- `POST /api/auth/logout` → `200`.
- `GET /api/auth/session` → `200 { user | null }`.
- Rutas internas gestionadas por Auth.js (`/api/auth/csrf`, etc.).
- Protección: rutas de la app y APIs validan sesión (`auth()`); sin sesión → `401`.

## Goals

### `GET /api/goals`
Lista de metas del usuario (no CANCELADAS por defecto; `?include=cancelled`).

`200` → `{ goals: GoalSummary[] }`
```
GoalSummary {
  id, name, category, status, dateMode, targetDate, planningMode, periodicity,
  targetAmount: int, plannedAmount: int|null, startDate,
  accumulated: int, remaining: int, progressPct: number,
  performanceStatus: 'EN_RITMO'|'NECESITA_ATENCION'|'ATRASADA'|'OBJETIVO_ALCANZADO'|'SIN_REFERENCIA',
  lastMovementDate: string|null
}
```

### `POST /api/goals`
Create. Body (validación zod, ver `knowledge/domain/goals.md` §8):
```
{ name, targetAmount, startDate,
  dateMode: 'TARGET_DATE'|'NO_DATE', targetDate?: string,
  planningMode: 'PERIODIC'|'FLEXIBLE', periodicity?: 'DAILY'|'WEEKLY'|'MONTHLY', plannedAmount?: int,
  category: 'AHORRO'|'COMPRA'|'DEUDA'|'VIAJE'|'FONDO'|'OTRO', description?: string|null }
```
`201` → `{ goal: GoalSummary }`. `400` validación (p.ej. `targetAmount <= 0`, `targetDate < startDate`, modalidad incoherente).

### `GET /api/goals/[id]`
`200` → `{ goal: GoalDetail }` (GoalSummary + movimientos recientes). `404` si no existe o no es del usuario.

### `PATCH /api/goals/[id]`
Editar configuración (mismos campos que create, parcial). No reescribe movimientos (BR-005).
`200` → `{ goal: GoalSummary }`. `400`/`404`.

### `POST /api/goals/[id]/status`
Body `{ status: 'ACTIVE'|'PAUSED'|'COMPLETED'|'CANCELLED' }`.
Regla: `COMPLETED` solo si `accumulated >= targetAmount` (si no → `400 COMPLETION_NOT_MET`).
`200` → `{ goal: GoalSummary }`.

### `DELETE /api/goals/[id]`
Elimina **por completo** la meta y sus movimientos (no reversible).
`200` → `{ deleted: true }`. `404` si no existe o no es del usuario.

## Movements

### `GET /api/goals/[id]/movements?limit=&offset=`
`200` → `{ movements: Movement[], total: int }`
```
Movement { id, goalId, date, type: 'deposit'|'withdrawal', amount: int, description: string|null, createdAt, updatedAt }
```
Orden: fecha DESC, created_at DESC.

### `POST /api/goals/[id]/movements`
Body `{ date, type, amount, description? }` (`amount > 0`, `type ∈ {deposit, withdrawal}`).
`201` → `{ movement }`. `400`/`404`.

### `PATCH /api/goals/[id]/movements/[mid]`
Editar (corrección de hechos). Body parcial de movimiento.
`200` → `{ movement }`. `400`/`404`.

### `DELETE /api/goals/[id]/movements/[mid]`
Eliminar (hard delete, corrección personal).
`200` → `{ deleted: true }`.

## Dashboard / Analytics / Projection

### `GET /api/dashboard`
`200` → `{ totals: { goals, targetAmount, accumulated, remaining, progressPct },
  byStatus: { active, paused, completed, cancelled },
  performance: { onTrack, needsAttention, behind, achieved },
  recentActivity: Movement[] }`
(Agregados sobre metas no CANCELADAS; `performance` con referencia evaluable.)

### `GET /api/goals/[id]/projection`
`200` → `{ remaining, requiredDaily, requiredWeekly, requiredMonthly,
  projectedDate: string|null, projectionBasis: 'HISTORICAL'|'PLAN'|'NONE',
  estimate: true, explanation: string,
  performanceStatus, behind: int|null, recoveryAmount: int|null, lastMovementDaysAgo: int|null }`

### `GET /api/goals/[id]/analytics`
`200` → `{ contributions: { byMonth: {month, deposits, withdrawals, net}[], averageDeposit, frequency, daysWithActivity }, planVsActual?: { expected: int[], actual: int[] } }`

## Convenciones de error

| Código | Caso |
| --- | --- |
| 400 | validación de payload / regla de negocio (con `code` específico) |
| 401 | sin sesión / credenciales inválidas |
| 403 | acceso a recurso de otro usuario (no aplica en MVP pero se valida) |
| 404 | recurso inexistente o no del usuario |
| 409 | conflicto (p.ej. `COMPLETION_NOT_MET`) |
| 500 | error interno (mensaje genérico, sin detalles internos) |

## Estructura de carpetas prevista

```
app/                       # App Router (rutas + api/)
  (auth)/login/page.tsx
  (app)/dashboard|metas|journal|analitica|configuracion/...
  api/auth/[...nextauth]/route.ts
  api/goals/route.ts, [id]/route.ts, [id]/status/route.ts, [id]/movements/...
  api/dashboard/route.ts
components/  lib/ (db, auth, calc, money, validators, http)
drizzle/     (schema.ts, migrations/)
tests/       (unit, e2e)
```