# ADR-007 — Testing

## Decision

- **Unit/component**: **Vitest + React Testing Library**.
- **E2E**: **Playwright** (flujos críticos: login, crear meta, aporte, retiro, dashboard, journal, editar meta, proyección, completar).
- **Integración API+DB**: tests contra Neon con esquema de prueba o transacciones que se revierten (rollback), nunca contra datos reales.
- Prioridad: fórmulas financieras, proyección y disciplina (tests específicos), validación del formulario dinámico, auth/authorization.

## Rationale

- Vitest es rápido y nativo TS; Playwright es el estándar E2E con buen soporte móvil/responsive.
- Las fórmulas de `knowledge/domain/goals.md` se prueban como funciones puras.

## Alternatives

- Jest: más configuración; Vitest es más simple para Vite/Next.
- Cypress: válido, pero Playwright integra mejor con el modelo de Vercel.

## Impact

- Bajo: solo define frameworks de test y estructura de carpetas de pruebas.

## Status

PROPUESTA (pendiente confirmación).