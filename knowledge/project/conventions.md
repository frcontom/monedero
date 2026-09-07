# Conventions

## Purpose

Convenciones de código para el proyecto monedero.

## Relevant Information

- TypeScript estricto en todo el proyecto.
- Componentes React en `components/`, con nombres PascalCase; hooks `use*`.
- Route handlers en `app/api/**/route.ts`; validación con zod antes de tocar la DB.
- Los cálculos financieros son funciones puras en `lib/calc/` (sin side effects, sin DB), con tests dedicados.
- Dinero siempre en centavos (entero) en el dominio; formateo solo en capa de presentación con `Intl.NumberFormat`.
- Consultas filtradas por `user_id` en cada operación (authorization).
- Sin comentarios salvo los necesarios; nombres expresivos.
- Commits pequeños, lógicos y trazables a una task (REQ/TASK).
- No se versionan `.env*`, `node_modules`, `next build` outputs.

## Rules

- Seguir ADRs registrados en `knowledge/decisions/`.
- No cambiar arquitectura sin ADR.
- No añadir dependencias sin justificación.

## Notes

- Fijar `engines` node en package.json según el entorno (Node 24).