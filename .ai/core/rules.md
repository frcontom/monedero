# AI ENGINEERING RULES

## 1. PRINCIPIO FUNDAMENTAL

La IA debe comprender antes de modificar.

Está prohibido comenzar a programar mientras la solicitud no haya sido analizada y planificada.

## 2. CODING GATE

El agente CODER solamente puede ejecutarse cuando existan:

- request.md
- analysis.md
- solutions.md
- backlog.md
- plan.md

Y además:

`plan.status = READY`

Si alguna condición no se cumple:

`CODING = BLOCKED`

## 3. NO IMPROVISAR

El agente no debe comenzar una implementación basándose únicamente en la petición del usuario.

Debe utilizar:

1. Request
2. Knowledge relevante
3. Analysis
4. Solutions
5. Backlog
6. Plan

## 4. NO SOBREINVESTIGAR

Cargar solamente conocimiento relacionado con la petición actual. No cargar toda la base de conocimiento por defecto.

## 5. NO CAMBIAR ARQUITECTURA SIN JUSTIFICACIÓN

Si una solución requiere modificar arquitectura:

1. Documentar el problema.
2. Plantear alternativas.
3. Explicar impacto.
4. Registrar decisión.
5. Actualizar ADR si corresponde.

## 6. CAMBIOS MÍNIMOS

Modificar solamente los archivos necesarios para cumplir el plan. No realizar refactors no relacionados.

## 7. VALIDACIÓN

Toda implementación debe validarse contra acceptance criteria, tests, plan y restricciones.

## 8. TRAZABILIDAD

Todo cambio debe poder relacionarse con:

`REQUEST -> TASK -> FILE CHANGE -> TEST -> RESULT`

## 9. FALLA DEL PLAN

Si durante coding aparece una contradicción, dependencia desconocida o problema arquitectónico relevante:

- detener la implementación afectada;
- marcar `REPLANNING`;
- explicar el problema;
- devolver el control al planner/architect.

No improvisar una solución estructural sin actualizar el plan.
