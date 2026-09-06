# AI Engineering System v1

Sistema de orquestación para separar análisis, arquitectura, planificación, coding, testing y documentación.

## Principio

`UNDERSTAND -> ANALYZE -> SOLUTIONS -> BACKLOG -> PLAN -> READY -> CODE -> TEST -> DOCUMENT -> DONE`

El coding está bloqueado hasta que `plan.md` exista y tenga `status: READY`.

## Integración con OpenCode

1. Copia `.ai/`, `knowledge/`, `work/` y `logs/` a la raíz del proyecto.
2. Configura OpenCode para leer `.ai/core/rules.md` y `.ai/agents/orchestrator.md` como instrucciones principales.
3. El orchestrator debe seleccionar el agente correspondiente según el estado.
4. El coder debe recibir únicamente el contexto relevante de la task.
5. Usa Git para la trazabilidad del código.

## Primera configuración

Completa como mínimo:

- `knowledge/project/project.md`
- `knowledge/project/stack.md`
- `knowledge/project/architecture.md`
- `knowledge/project/conventions.md`
- `knowledge/project/constraints.md`
- archivos de `knowledge/technical/`

## Flujo recomendado

Cada petición crea:

`work/active/REQ-YYYYMMDD-NNN/`

con:

- request.md
- analysis.md
- solutions.md
- backlog.md
- plan.md
- execution.md
- result.md

Al terminar, mover el expediente a `work/archive/`.
