# BACKLOG

```yaml
request_id: REQ-20260906-001
status: BACKLOG
```

## Nota de estado

Backlog candidato basado en `docs/implementation-brief.md` §19 y §21. **TASK-000 (infraestructura) resuelta** (Neon validado); **TASK-001 (reglas) aprobada** (`knowledge/domain/goals.md`, COP/es-CO). **Todas las decisiones técnicas aprobadas por el usuario** (ADRs). `plan.status = READY` → se inicia la implementación.

## Tasks

### TASK-000 — Validar infraestructura (DB + Vercel) [CERRADA]

- Priority: P0
- Dependencies: none
- Components: database, deployment
- Files: knowledge/technical/infrastructure.md, knowledge/technical/database.md, knowledge/decisions/ADR-002-database-neon-postgres.md
- Expected change: cierre de decisión de DB y modelo de despliegue.
- Risk: Mitigado.
- Status: **RESUELTA** — Neon PostgreSQL validado (SSL, pooler, permisos, latencia). Vercel: proyecto `monedero-seven` (`https://monedero-seven.vercel.app/`), vinculación en TASK-018.

#### Acceptance Criteria

- [x] PostgreSQL accesible de forma remota y segura (SSL, pooler, latencia, permisos de migración).
- [x] Decisión de motor documentada (ADR-002).
- [x] Proyecto Vercel / dominio confirmados (`monedero-seven`).
- [x] Secretos gestionados por variables de entorno (a concretar en TASK-003).

### TASK-001 — Cerrar decisiones funcionales y matemáticas [PROPUESTA]

- Priority: P0
- Dependencies: none (propuesta entregada; requiere confirmación)
- Components: domain, backend, frontend
- Files: knowledge/domain/goals.md, knowledge/decisions/ADR-004, ADR-006 (parcial)
- Expected change: reglas exactas de rendimiento, proyección, disciplina, completitud; políticas de edición/eliminación; categorías; periodicidad.
- Risk: mitigado con reglas documentadas y testeadas.
- Status: **APROBADA** — reglas confirmadas por el usuario; moneda COP / locale es-CO (sin decimales).

#### Acceptance Criteria

- [x] Fórmulas documentadas (knowledge/domain/goals.md).
- [x] Políticas de edición/eliminación definidas.
- [x] Categorías y periodicidad definidas.
- [x] Moneda/locale confirmados (COP / es-CO).
- [x] Aprobación del usuario de las reglas.

### TASK-002 — Análisis técnico final / ADRs

- Priority: P0
- Dependencies: TASK-000, TASK-001
- Components: all
- Files: knowledge/technical/*, knowledge/project/*, knowledge/decisions/* (ADRs), docs/
- Expected change: stack definitivo, arquitectura, estrategia backend/auth/PWA/testing, estructura de proyecto, API contracts.
- Risk: Bajo si TASK-000/001 cerradas.

#### Acceptance Criteria

- [ ] Stack definitivo documentado (knowledge/project/stack.md).
- [ ] Arquitectura documentada (architecture.md).
- [ ] ADRs registrados.
- [ ] API contracts y modelo de datos definidos.
- [ ] Plan `status: READY`.

### TASK-003 — Inicializar proyecto / foundation

- Priority: P0
- Dependencies: TASK-002
- Components: repo
- Files: package.json, configs, .gitignore, README, CI/lint/format, variables de entorno
- Expected change: esqueleto del proyecto con calidad base.
- Risk: sin .gitignore riesgo de comitear secretos.

#### Acceptance Criteria

- [ ] Proyecto React inicializado; package manager fijado.
- [ ] `.gitignore` protege `.env`, `node_modules`, build.
- [ ] Lint/typecheck funcionan.
- [ ] Secretos solo por variables de entorno.

### TASK-004 — Configurar base de datos (esquema, migraciones, constraints)

- Priority: P0
- Dependencies: TASK-000, TASK-003
- Components: database
- Files: migraciones, seed (usuario inicial), knowledge/technical/database.md
- Expected change: esquema users/goals/goal_movements/goal_plans (o equivalente), tipos monetarios precisos, PK/FK, índices, integridad referencial, timestamps.
- Risk: R-001, R-002, R-003.

#### Acceptance Criteria

- [ ] Migraciones aplicables desde el entorno de despliegue.
- [ ] Sin tipos floating point para dinero.
- [ ] Separación lógica por user_id.

### TASK-005 — Autenticación

- Priority: P0
- Dependencies: TASK-003, TASK-004
- Components: backend, frontend
- Files: API auth, sesión/token, login UI, protección de rutas
- Expected change: login/logout/sesión actual; hash seguro; autorización por operación; rate limiting si aplica.
- Risk: exposición de secretos, sesiones inseguras.

#### Acceptance Criteria

- [ ] AC-015 (credenciales nunca en cliente).
- [ ] Acceso no autorizado denegado.
- [ ] No se registran contraseñas/secretos.

### TASK-006 — Modelo de metas

- Priority: P0
- Dependencies: TASK-004, TASK-001
- Components: backend, database
- Files: modelo Goal/GoalPlan, validaciones
- Expected change: persistencia de configuración completa de meta (fecha, plan, estado, categoría, descripción) con coherencia (BR-006/007/008).

#### Acceptance Criteria

- [ ] Meta con/sin fecha, periódica/flexible persistida coherentemente.
- [ ] Campos dependientes coherentes (BR-008).

### TASK-007 — CRUD de metas + estados

- Priority: P0
- Dependencies: TASK-006
- Components: backend, frontend
- Files: API goals, UI lista/detalle, cambios de estado
- Expected change: listar/crear/leer/actualizar/eliminar o cancelar según política (TASK-001); estados ACTIVA/PAUSADA/COMPLETADA/CANCELADA.
- Risk: edición sin sobreescribir historial (BR-005).

#### Acceptance Criteria

- [ ] AC-001, AC-003, AC-004, AC-007, AC-016.
- [ ] Modificar meta no altera movimientos.

### TASK-008 — Formulario dinámico de meta (modal reutilizable)

- Priority: P0
- Dependencies: TASK-007
- Components: frontend
- Files: GoalModal (crear/editar), lógica de dependencias, validación
- Expected change: formulario progresivo; habilitar/limpiar campos dependientes; todos los campos aplicables obligatorios; nunca guardar configuración contradictoria.
- Risk: R-005 (complejidad UX/validación).

#### Acceptance Criteria

- [ ] AC-001, AC-002, AC-003, AC-004.
- [ ] CLEAR/INVALIDATE al invalidar campos dependientes.
- [ ] Misma conceptualización para crear y editar (ADR-003/004/005).

### TASK-009 — Movimientos (+/-)

- Priority: P0
- Dependencies: TASK-006, TASK-007
- Components: backend, frontend
- Files: API movements, registro rápido de aporte/retiro, historial
- Expected change: aportes positivos, retiros negativos, fecha, valor, descripción; acumulado derivado de movimientos; política de edición/eliminación según TASK-001.
- Risk: R-003 (precisión monetaria).

#### Acceptance Criteria

- [ ] AC-005, AC-006, AC-007, AC-010.
- [ ] Historial preservado (BR-003/005).

### TASK-010 — Journal / calendario

- Priority: P0
- Dependencies: TASK-009
- Components: frontend
- Files: calendario, vista de día, detalle
- Expected change: días con actividad, aportes, retiros, total del día, detalle; usable con touch en móvil.
- Risk: usabilidad móvil.

#### Acceptance Criteria

- [ ] AC-009, AC-013.

### TASK-011 — Dashboard

- Priority: P0
- Dependencies: TASK-007, TASK-009
- Components: frontend, backend
- Files: vista dashboard, resumen, actividad reciente
- Expected change: totales (metas, objetivo, acumulado, pendiente), progreso global, metas completadas/en atención, actividad reciente.
- Risk: bajo.

#### Acceptance Criteria

- [ ] AC-008.

### TASK-012 — Curva de progreso

- Priority: P0
- Dependencies: TASK-009
- Components: frontend
- Files: gráfica de evolución real vs objetivo/plan
- Expected change: curva de progreso acumulado vs plan (cuando exista).
- Risk: legibilidad en móvil.

#### Acceptance Criteria

- [ ] Gráfica legible en móvil y desktop.

### TASK-013 — Proyección

- Priority: P0
- Dependencies: TASK-009, TASK-001 (fórmulas)
- Components: backend, frontend
- Files: cálculo de proyección, UI
- Expected change: monto restante, ritmo necesario, aporte diario/semanal/mensual equivalente, fecha proyectada; etiquetado como estimación (BR-011).
- Risk: R-004 (proyección engañosa).

#### Acceptance Criteria

- [ ] AC-011.
- [ ] Fórmulas documentadas y testeadas.

### TASK-014 — Disciplina

- Priority: P0
- Dependencies: TASK-013, TASK-001 (reglas)
- Components: backend, frontend
- Files: cálculo de rendimiento, mensajes accionables
- Expected change: EN RITMO / NECESITA ATENCIÓN / ATRASADA / OBJETIVO ALCANZADO según reglas documentadas; cuánto falta para recuperar ritmo; último movimiento.
- Risk: reglas arbitrarias (BR-012).

#### Acceptance Criteria

- [ ] AC-012.
- [ ] Alertas basadas en datos, no motivacionales.

### TASK-015 — Analítica

- Priority: P0
- Dependencies: TASK-009, TASK-013
- Components: backend, frontend
- Files: métricas, plan vs real, desviación, velocidad de acumulación
- Expected change: aportes por periodo, retiros, promedio, frecuencia, evolución temporal, plan vs real.
- Risk: métricas sin utilidad.

#### Acceptance Criteria

- [ ] Métricas accionables para toma de decisiones.

### TASK-016 — PWA + Responsive

- Priority: P0
- Dependencies: TASK-007, TASK-008, TASK-010, TASK-012 (componentes UI)
- Components: frontend, infra
- Files: manifest, iconos, service worker mínimo, breakpoints, touch
- Expected change: instalable desde navegador; 100% responsive mobile-first (móvil pequeño→desktop); funcionalidades no ocultas en móvil.
- Risk: offline complejo fuera de scope.

#### Acceptance Criteria

- [ ] AC-013, AC-014.

### TASK-017 — Testing

- Priority: P0
- Dependencies: todas las funcionalidades (parcial por módulo)
- Components: all
- Files: unit (cálculos, validación), integration (API+DB, auth), E2E (flujos críticos), security, responsive
- Expected change: cobertura de flujos críticos; tests de fórmulas financieras/proyección/disciplina.
- Risk: bajo si frameworks definidos en TASK-002.

#### Acceptance Criteria

- [ ] Tests unit/integration/E2E pasan.
- [ ] Tests de fórmulas financieras específicos.

### TASK-018 — Despliegue (Git + Vercel + variables + DB segura)

- Priority: P0
- Dependencies: TASK-000, TASK-017, todas las funcionalidades
- Components: infra, repo
- Files: vercel.json (si aplica), variables de entorno, smoke tests
- Expected change: app desplegada en HTTPS con DB segura; Git trazable; sin secretos en repo.
- Risk: R-001, R-002; fuga de secretos.

#### Acceptance Criteria

- [ ] Despliegue funcionando en HTTPS.
- [ ] DB accesible solo desde backend.
- [ ] Sin secretos en Git (AC-015, AC-016).

## Dependency Graph

```text
TASK-000 ─┐
TASK-001 ─┼─> TASK-002 ─> TASK-003 ─> TASK-004 ─> TASK-005
          │
          └─> TASK-004 ─> TASK-006 ─> TASK-007 ─> TASK-008
                                └──────> TASK-009 ─> TASK-010
                                          ├──> TASK-011
                                          ├──> TASK-012 ─> TASK-013 ─> TASK-014
                                          └──> TASK-015
TASK-007/008/010/012 ─> TASK-016
(all) ─> TASK-017 ─> TASK-018
```

## Bloqueantes actuales

**Ninguno.** Todos los bloqueantes se resolvieron (infraestructura validada, stack/reglas aprobados, moneda COP/es-CO, Vercel `monedero-seven`). `plan.status = READY`.