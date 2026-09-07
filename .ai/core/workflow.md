# AI SOFTWARE ENGINEERING WORKFLOW

## PHASE 0 — RECEIVE

Recibir la petición, asignar REQ-ID y crear `work/active/REQ-ID/request.md`.

No modificar código.

## PHASE 1 — UNDERSTANDING / ANALYSIS

Determinar objetivo, problema, alcance, fuera de alcance, componentes afectados, restricciones, dependencias, riesgos, información faltante y acceptance criteria.

Resultado: `analysis.md`.

## PHASE 2 — SOLUTIONS

Revisar arquitectura y conocimiento relevante. Generar alternativas y seleccionar una solución recomendada.

Resultado: `solutions.md`.

## PHASE 3 — BACKLOG

Convertir la solución en tareas ejecutables, con IDs, dependencias, archivos/componentes, prioridad y criterios de aceptación.

Resultado: `backlog.md`.

## PHASE 4 — PLAN

Crear el plan exacto de implementación: orden, archivos, estrategia, tests, validaciones y restricciones.

Resultado: `plan.md` con `status: READY`.

## PHASE 5 — CODING

Solo permitido con plan READY. Implementar task por task.

## PHASE 6 — TESTING

Validar implementación y acceptance criteria. Si falla por una causa que requiere replanteamiento, usar `REPLANNING`.

## PHASE 7 — DOCUMENTATION

Registrar cambios, archivos, tests, decisiones, problemas y resultado.

## PHASE 8 — DONE

Una request está DONE solamente cuando implementación, tests, criterios de aceptación y documentación están completos.
