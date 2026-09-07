# SOLUTIONS

```yaml
request_id: REQ-20260906-001
status: SOLUTIONS
recommended_solution: SOLUTION-A (monolito React + API + PG/MySQL remota, validada)
```

## Contexto

La arquitectura del brief (React + API + PostgreSQL, Vercel) es razonable y se mantiene como candidata, pero **no puede cerrarse** hasta validar infraestructura. A continuación se comparan alternativas para las decisiones abiertas.

## Solution A — React + API en Vercel + base de datos relacional remota

Stack propuesto (preferente del brief):
- Frontend: React + bundler (Vite) o framework (Next.js), PWA, mobile-first.
- Backend: API en el mismo deploy de Vercel (Serverless Functions) o capa separada.
- Database: PostgreSQL (preferido) o MySQL, remota (Namecheap), nunca expuesta al navegador.
- Money: sin floating point (NUMERIC/NUMBER o entero en cents).
- Auth: único usuario, email+password con hash seguro.

### Ventajas
- Arquitectura clara y simple; separación frontend/backend.
- Base relacional sólida; trazabilidad; crecimiento futuro a multiusuario soportado (separación lógica por `user_id`).
- Una sola plataforma de despliegue (Vercel) para frontend y funciones API.
- Cumple restricciones de simplicidad (sin microservicios, colas, Redis, Kafka).

### Desventajas
- Requiere validar conectividad segura Vercel → DB remota (pooling, SSL, latencia, límites).
- Serverless exige gestión cuidadosa de conexiones.
- El proveedor Namecheap puede restringir acceso remoto/firewall/SSL.

### Riesgos
- R-001, R-002, R-003 (ver análisis).

### Impacto
- Alto: define todo el resto del sistema. Sin validar, no se puede implementar.

## Solution B — React + BaaS (Supabase/Firebase/Neon)

Backend/DB/Auth como servicio externo.

### Ventajas
- Rápido; auth y DB gestionados; conectividad desde Vercel casi garantizada; Postgres real en Supabase/Neon.
- Menos fricción de infraestructura.

### Desventajas
- Introduce servicio externo adicional (el brief §12-C descarta BaaS inicialmente).
- Dependencia de tercero; costos; migración de datos posterior más compleja.
- Contradice la intención de aprovechar el hosting existente de Namecheap.

### Riesgos
- Dependencia de plataforma; fuga de datos a terceros.

### Impacto
- Medio-alto: cambia la infraestructura prevista por el brief.

## Solution C — React + API + MySQL

Seleccionar MySQL si Namecheap ofrece mejor soporte para acceso remoto desde Vercel.

### Ventajas
- Disponibilidad frecuente en hosting; familiaridad; buena compatibilidad.

### Desventajas
- Menos capacidad analítica/modelado que PostgreSQL; depende de las capacidades reales del hosting.

### Impacto
- Medio: misma arquitectura, cambia el motor de DB.

## Recommendation

Adoptar **Solution A** con la siguiente concreción (propuesta — ver ADRs y `knowledge/`):

| Área | Decisión propuesta | ADR |
| --- | --- | --- |
| Frontend + API | Next.js 15 App Router (React 19, TS), route handlers serverless en Vercel | ADR-001 |
| Database | Neon PostgreSQL (validada) — reemplaza Namecheap | ADR-002 |
| ORM/Migraciones | Drizzle ORM + node-postgres + drizzle-kit | ADR-003 |
| Dinero | enteros en centavos (bigint) | ADR-004 |
| Auth | Auth.js (NextAuth v5) Credentials + bcrypt, JWT httpOnly | ADR-005 |
| UI/PWA/Forms | Tailwind + Serwist (PWA) + Recharts + date-fns + TanStack Query + RHF/zod | ADR-006 |
| Testing | Vitest + RTL + Playwright | ADR-007 |

Reglas funcionales/matemáticas propuestas: ver `knowledge/domain/goals.md` (acumulado, progreso, ritmo esperado, rendimiento con umbrales 90%/70%, proyección por ritmo promedio, déficit/recuperación, completitud, políticas de edición/eliminación, categorías enum, periodicidad DAILY/WEEKLY/MONTHLY).

## Rationale

- El brief ya razonó esta arquitectura (ADR-008/009). La única divergencia real es la base de datos: **Neon PostgreSQL** (real, validada) en lugar de Namecheap (ADR-002).
- El stack propuesto minimiza piezas en Vercel, garantiza precisión monetaria y cumple seguridad (DB solo server-side, validación server-side, autorización por user_id).
- Reglas documentadas y testeadas, evitando mensajes arbitrarios (BR-012).

## Decisions (resumen de estado)

- **Resueltas por validación**: base de datos (Neon PG).
- **Aprobadas por el usuario**: stack completo (ADRs 001/003/004/005/006/007), reglas matemáticas (`knowledge/domain/goals.md`), moneda/locale (**COP / es-CO**, sin decimales).
- **Vercel**: proyecto `monedero-seven` → `https://monedero-seven.vercel.app/` (vinculación en TASK-018).