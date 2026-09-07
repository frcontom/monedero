# Testing

## Purpose

Definir la estrategia de testing (ADR-007).

## Relevant Information

- **Unit/component**: Vitest + React Testing Library. Prioridad: fórmulas de `knowledge/domain/goals.md` (acumulado, progreso, ritmo, rendimiento, proyección, déficit), validación del formulario dinámico, utilidades de dinero.
- **Integración**: API + DB sobre Neon con transacciones revertidas o esquema de prueba (nunca datos reales); auth y autorización (acceso a metas ajenas denegado).
- **E2E**: Playwright. Flujos: login → crear meta (modal dinámico) → aporte → retiro → dashboard → journal → editar meta → proyección → completar meta.
- **Responsive**: móvil pequeño/estándar, tablet, laptop, desktop.
- **Security**: acceso no autorizado, inyección, XSS, manejo de sesión, secretos, endpoints protegidos.

## Rules

- Las fórmulas financieras/proyección/disciplina tienen tests específicos obligatorios.
- Ejecutar tests antes de marcar una task como terminada.

## Notes

- Framework E2E y unit fijados; scripts npm a configurar en TASK-003/017.