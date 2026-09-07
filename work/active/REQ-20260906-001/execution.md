# EXECUTION

```yaml
request_id: REQ-20260906-001
status: CODING
```

## Progreso por task

### TASK-002 — API contracts ✓
- `docs/api-contracts.md`: endpoints, payloads, errores, estructura.

### TASK-003 — Foundation ✓
- Next.js 16.3.4 (App Router), React 19.2, TS 5.9, Tailwind 4.
- `.gitignore`, `.env.example`, `.env.local` (gitignored), `tsconfig`, `next.config`, `eslint.config.mjs`, `postcss.config.mjs`.
- Scripts: dev/build/start/lint/typecheck/test/e2e/db:*.
- ESLint fijado a 9.x por compatibilidad de `eslint-config-next` con `eslint-plugin-react`.

### TASK-004 — Base de datos ✓
- Drizzle ORM + node-postgres + drizzle-kit. Esquema: `users`, `goals`, `goal_movements` con enums, checks de coherencia (plan/modalidad), índices.
- Migración `0000` aplicada a Neon. Seed del usuario `feconto@gmail.com` (hash bcrypt).

### TASK-005 — Autenticación ✓
- Auth.js v5 (next-auth@beta), Credentials + bcrypt, JWT httpOnly.
- `auth.config.ts` (middleware Edge) + `auth.ts` (full config con DB).
- Login (`/login`), middleware de protección, sesión verificada E2E.

### TASK-006 — Modelo + cálculos ✓
- `lib/calc/goals.ts`: acumulado, restante, progreso, ritmo esperado (lineal/plan), estado de rendimiento (90/70), proyección, déficit/recuperación, analytics por mes. Fórmulas según `knowledge/domain/goals.md`.
- `lib/validators/goal.ts`: esquemas zod compartidos con coherencia de modalidad.

### TASK-007 — CRUD metas + estados ✓
- API: `GET/POST /api/goals`, `GET/PATCH/DELETE /api/goals/[id]`, `POST /api/goals/[id]/status`.
- Regla de completitud: `COMPLETED` requiere `accumulated >= target` (409 si no). Soft-delete = CANCELADA.

### TASK-008 — Formulario dinámico ✓
- `GoalModal` reutilizable crear/editar (RHF + zod), progresivo: fecha objetivo ↔ sin fecha; periódico ↔ flexible; CLEAR/INVALIDATE de campos dependientes.
- **Bug corregido**: campos numéricos vacíos producían `NaN` (zod v4 lo rechaza) bloqueando el submit de forma silenciosa en campos ocultos → `setValueAs` devuelve `undefined` en vacío; la modalidad FLEXIBLE setea `plannedAmount=undefined`.

### TASK-009 — Movimientos ✓
- API: `GET/POST movements`, `PATCH/DELETE movements/[mid]`. Edición y eliminación permitidas (corrección de hechos).
- UI: `MovementForm` (aporte/retiro), `MovementRow` (editar/eliminar inline).

### TASK-010/011/012 — Journal, Dashboard, Curva ✓
- Journal: `GET /api/journal?month=` + calendario mensual (días con actividad, neto, detalle por día).
- Dashboard: `GET /api/dashboard` (totales, por estado, rendimiento, actividad reciente) + vista.
- Curva de progreso: Recharts (real vs esperado) en detalle.

### TASK-013/014/015 — Proyección, Disciplina, Analítica ✓
- `GET /api/goals/[id]/projection` (ritmo requerido, fecha proyectada por plan o histórico, déficit, recuperación, último movimiento) + tarjetas de disciplina en detalle.
- `GET /api/goals/[id]/analytics` (aportes por mes, promedio, frecuencia, plan vs real) + vista.

### TASK-016 — PWA + Responsive ✓
- Manifest (`app/manifest.ts`), iconos 192/512 (sharp), service worker manual (`public/sw.js`) con caché del shell, registro en producción.
- Serwist descartado: inyecta config webpack incompatible con Turbopack de Next 16.
- Nav responsive (bottom tabs móvil / header desktop).

### TASK-017 — Testing ✓
- Vitest + RTL: 44 tests (cálculos financieros, validadores, dinero, formulario dinámico, submit).
- Playwright: 3 E2E (login, redirección sin sesión, flujo completo crear meta + aporte) en verde.

### TASK-018 — Deploy
- Pendiente: commit inicial y conexión con Vercel (proyecto `monedero-seven`, dominio `https://monedero-seven.vercel.app/`).

## Verificación final
- `typecheck`: OK · `lint`: OK · `build`: OK · `test`: 44/44 · `e2e`: 3/3.
- Base de datos limpia de datos de prueba.