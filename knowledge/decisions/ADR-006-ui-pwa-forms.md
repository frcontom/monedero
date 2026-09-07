# ADR-006 — UI, PWA, estado y formularios

## Decision

- UI: **Tailwind CSS** (mobile-first, responsive 100%), componentes propios (sin librería de UI pesada).
- PWA: **Serwist** (`@serwist/next`) para manifest + service worker mínimo (instalación + shell). Offline avanzado fuera del MVP (brief §9.17).
- Gráficas: **Recharts** (curva de progreso, analítica).
- Fechas: **date-fns** (formato, calendario/journal).
- Estado servidor: **TanStack Query v5**.
- Formularios: **React Hook Form + zod** (formulario dinámico de meta con dependencias y validación; zod compartido cliente/servidor).

## Rationale

- Todo el conjunto es liviano, mobile-first y compatible con Next.js/App Router.
- Recharts y date-fns son responsive y touch-friendly (requisitos de journal/curva en móvil).
- RHF+zod soporta el formulario dinámico (CLEAR/INVALIDATE) y validación server-side reutilizando esquemas.

## Alternatives

- Librerías de UI (shadcn/MUI): más peso y estilos a dominar; no necesarias para el alcance.
- Chart.js/visx: alternativa válida; Recharts es el estándar pragmático con React.
- Redux/Zustand global: innecesario; TanStack Query cubre el estado servidor.

## Impact

- Medio: fija dependencias del frontend y la estrategia PWA/manifest/iconos.

## Status

PROPUESTA (pendiente confirmación).