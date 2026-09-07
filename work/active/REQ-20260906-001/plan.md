# PLAN

```yaml
request_id: REQ-20260906-001
status: READY
```

> **`status: READY`** — Infraestructura validada (Neon PostgreSQL), stack y reglas **aprobados por el usuario** (ADRs + `knowledge/domain/goals.md`), moneda **COP / es-CO** (sin decimales), Vercel `monedero-seven` (`https://monedero-seven.vercel.app/`). Puede iniciarse la implementación.

## Decision

Arquitectura: **Next.js 15 (App Router) + Neon PostgreSQL + Drizzle + Auth.js**, despliegue en Vercel (`monedero-seven`). Concreción en ADR-001..007. Reglas matemáticas en `knowledge/domain/goals.md`. **Moneda: COP / es-CO, sin decimales ($ 10.000); fechas dd/mm/yyyy.** Divergencia respecto al brief: base de datos real es **Neon** (no Namecheap) — ADR-002.

## Implementation Order (previsto, una vez READY)

1. TASK-002 — análisis técnico final + API contracts + ADRs completos.
2. TASK-003 — foundation (proyecto Next.js, .gitignore, lint/typecheck, env).
3. TASK-004 — base de datos (Drizzle esquema + migraciones + seed usuario).
4. TASK-005 — autenticación (Auth.js, login UI, protección de rutas).
5. TASK-006 — modelo de metas (reglas de configuración, validación).
6. TASK-007 — CRUD de metas + estados.
7. TASK-008 — formulario dinámico de meta (modal reutilizable).
8. TASK-009 — movimientos (+/-) y acumulados.
9. TASK-010 — journal/calendario.
10. TASK-011 — dashboard.
11. TASK-012 — curva de progreso.
12. TASK-013 — proyección.
13. TASK-014 — disciplina.
14. TASK-015 — analítica.
15. TASK-016 — PWA + responsive.
16. TASK-017 — testing.
17. TASK-018 — despliegue (Git + Vercel + env + DB segura).

## Task Execution Plan

> Detalle completo por task se escribirá cuando el plan alcance READY. Próximas tareas ejecutables tras confirmación:

### TASK-002 — Análisis técnico final / API contracts

- Files: `app/api/**` (contratos), `knowledge/technical/*`, ADRs.
- Changes: definir contratos exactos (payloads, códigos HTTP, errores), estructura de carpetas, validaciones zod, reglas de cálculo como funciones puras.
- Dependencies: aprobación del stack.
- Tests: casos de validación por endpoint (plan de tests).
- Validation: contratos coherentes con `knowledge/domain/goals.md`.
- Constraints: seguridad, no exponer DB, autorización por user_id.

### TASK-003 — Foundation

- Files: `package.json`, `next.config.*`, `tailwind.*`, `tsconfig.json`, `.gitignore`, `drizzle.config.ts`, `.env.example`.
- Changes: proyecto Next.js TypeScript; scripts (dev, build, lint, typecheck, test); `.gitignore` (`.env*`, `node_modules`, `.next`, `.vercel`); `.env` local gitignored (DATABASE_URL, AUTH_SECRET, CURRENCY_CODE, LOCALE).
- Dependencies: TASK-002.
- Tests: `npm run lint` y `npm run typecheck` verdes.
- Validation: build local OK.
- Constraints: secretos nunca en Git.

## Acceptance Criteria (de esta iteración)

- [x] Radiografía del ecosistema completada.
- [x] Expediente REQ-20260906-001 creado.
- [x] Infraestructura de datos validada (Neon).
- [x] Stack y reglas propuestos, documentados y **aprobados** (ADRs + knowledge).
- [x] Moneda/locale confirmados (COP / es-CO).
- [x] Vercel confirmado (`monedero-seven`).
- [x] `plan.status = READY`.

## Rollback / Recovery

Sin código aún, no aplica rollback de datos. Durante implementación: cualquier contradicción/limitación → `REPLANNING` (parar task afectada, actualizar solutions/backlog/plan). Si Neon resultara insuficiente en despliegue → evaluar alternativa de PostgreSQL gestionado (ADR-002 lista alternativas).

## Risks

- R-001 (reducido): Neon validado; riesgo residual de límites de plan/gratuito en producción.
- R-002: mitigado con endpoint pooled + Pool con `max` pequeño.
- R-003: mitigado (bigint centavos, ADR-004).
- R-004: proyecciones etiquetadas como estimación.
- R-005: formulario dinámico con RHF+zod + tests E2E.
- R-006: stack mínimo justificado.
- R-007/R-008: infra validada; `.gitignore` en TASK-003.

## Final Gate

Superado. Todas las condiciones de READY se cumplen (infraestructura validada, decisiones aprobadas, moneda/locale y Vercel confirmados). El plan queda **READY**; la implementación puede comenzar por TASK-002.