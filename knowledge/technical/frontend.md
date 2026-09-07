# Frontend

## Purpose

Definir el frontend (propuesta REQ-20260906-001, ADR-001/006).

## Relevant Information

- Next.js 15 App Router + React 19 + TypeScript; Tailwind CSS; mobile-first.
- Navegación: login, dashboard, metas, detalle de meta, journal/calendario, analítica, configuración.
- Modal reutilizable y dinámico para crear/editar metas (React Hook Form + zod; CLEAR/INVALIDATE de campos dependientes).
- Gráficas: Recharts (curva de progreso, analítica). Calendario/journal con date-fns, touch-friendly.
- Estado servidor: TanStack Query.
- PWA: Serwist (manifest + icons + SW mínimo).
- Formateo de dinero con `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })` (sin decimales, ej. `$ 10.000`); fechas `dd/mm/yyyy`.

## Rules

- 100% responsive; ninguna funcionalidad importante exclusiva de desktop.
- Validación en cliente para UX + validación server-side obligatoria.
- Los valores calculados se muestran, nunca se solicitan al usuario.

## Notes

- Iconos PWA (192/512) a generar en TASK-016.