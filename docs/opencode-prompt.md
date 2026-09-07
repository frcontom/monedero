# PROMPT PARA OPENCODE

Lee primero `implementation-brief.md`.

Actúa como **Senior Software Architect + Senior Full-Stack Engineer + QA Engineer + DevOps Engineer**.

El objetivo es implementar el sistema descrito en `implementation-brief.md`.

## REGLA PRINCIPAL

NO comiences programando inmediatamente.

Primero debes ejecutar una **FASE DE ANÁLISIS TÉCNICO**.

Después de cerrar ese análisis, inicia la implementación.

El flujo obligatorio es:

```text
INSPECT
  ↓
ANALYZE
  ↓
VALIDATE
  ↓
DECIDE
  ↓
DOCUMENT
  ↓
IMPLEMENT
  ↓
TEST
  ↓
VALIDATE
  ↓
REPORT
```

## 1. PRIMERA FASE — INSPECCIÓN

Antes de modificar cualquier archivo:

- inspecciona el repositorio;
- identifica si está vacío o contiene un proyecto;
- revisa package.json y configuración existente;
- identifica Node y package manager;
- revisa Git;
- identifica configuración de Vercel si existe;
- revisa archivos de entorno sin exponer secretos;
- identifica restricciones del entorno.

No inventes información.

## 2. ANÁLISIS TÉCNICO

Determina y documenta:

- arquitectura frontend;
- arquitectura backend/API;
- base de datos;
- ORM/driver;
- autenticación;
- estructura del proyecto;
- estrategia PWA;
- estrategia responsive;
- librerías necesarias;
- validaciones;
- modelo de datos;
- API contracts;
- estrategia de testing;
- estrategia de deployment;
- seguridad;
- manejo de dinero;
- cálculos de progreso;
- proyección;
- disciplina.

### BASE DE DATOS

La preferencia es **PostgreSQL**.

Pero debes verificar primero si la base de datos remota disponible en Namecheap puede utilizarse correctamente desde el entorno de despliegue en Vercel.

Valida:

- acceso remoto;
- firewall;
- SSL/TLS;
- credenciales;
- conectividad;
- pooling;
- límites.

Si PostgreSQL no es viable, evalúa MySQL.

No asumas que Namecheap permite una determinada configuración.

Si la infraestructura no puede validarse y eso bloquea la implementación, detente y reporta el bloqueo.

## 3. DOCUMENTACIÓN DEL ANÁLISIS

Antes de implementar funcionalidad, deja documentadas las decisiones técnicas importantes.

Incluye, como mínimo:

- arquitectura;
- stack;
- database;
- autenticación;
- PWA;
- estructura;
- API;
- modelo de datos;
- cálculos;
- testing;
- deployment;
- riesgos;
- ADR.

No cambies los requisitos funcionales aprobados salvo que exista una contradicción real.

## 4. IMPLEMENTACIÓN

Después de cerrar el análisis:

Implementa en orden lógico:

1. foundation;
2. database;
3. backend/API;
4. authentication;
5. goals;
6. dynamic goal form;
7. movements;
8. dashboard;
9. journal/calendar;
10. analytics;
11. projection;
12. discipline;
13. responsive;
14. PWA;
15. tests;
16. deployment.

## 5. REGLAS DEL PRODUCTO

Debes respetar estrictamente:

- sistema inicialmente personal;
- metas para comprar, pagar, conseguir o ahorrar;
- aportes positivos;
- movimientos negativos/retiros;
- historial;
- metas editables;
- estados;
- fecha de inicio;
- fecha objetivo o sin fecha;
- planificación periódica;
- planificación flexible;
- formulario dinámico;
- todos los campos aplicables obligatorios;
- modal reutilizable para crear/editar;
- dashboard;
- journal;
- analítica;
- proyección;
- disciplina;
- curva de progreso;
- responsive 100%;
- mobile-first;
- PWA.

## 6. FORMULARIO DE META

El formulario debe ser dinámico.

No muestres todos los campos posibles desde el inicio.

Las decisiones del usuario deben habilitar campos posteriores.

Ejemplo:

```text
Fecha objetivo
    ↓
habilita configuración de fecha

Plan periódico
    ↓
habilita periodicidad

Mensual
    ↓
habilita monto mensual

Flexible
    ↓
deshabilita campos periódicos
```

Cuando un campo deje de aplicar:

- limpia o invalida su valor;
- evita guardar datos contradictorios.

El usuario nunca debe poder guardar una meta incompleta.

## 7. DINERO

Nunca utilices floating point para representar dinero.

Define una estrategia precisa.

Prueba:

- aportes;
- retiros;
- acumulados;
- porcentajes;
- montos restantes;
- proyecciones.

## 8. DISCIPLINA

El sistema no debe ser solamente un CRUD financiero.

Debe responder:

> ¿Estoy cumpliendo el ritmo necesario?

Y cuando corresponda:

> ¿Cuánto me falta para recuperar el ritmo?

Las reglas deben ser matemáticamente explicables y estar documentadas.

## 9. RESPONSIVE

El sistema debe funcionar completamente en:

- móvil pequeño;
- móvil;
- tablet;
- laptop;
- desktop.

No escondas funcionalidades importantes en móvil.

El modal de meta debe adaptarse.

El calendario debe ser usable con touch.

Las gráficas deben seguir siendo legibles.

## 10. PWA

Implementa la aplicación como PWA.

Debe incluir:

- manifest;
- iconos;
- instalación;
- experiencia adecuada para móvil.

No agregues offline complejo salvo que exista una necesidad real.

## 11. SEGURIDAD

Nunca:

- expongas credenciales DB al navegador;
- guardes secretos en Git;
- confíes solamente en validación frontend;
- permitas acceso a recursos sin autorización.

Protege API y autenticación.

Usa HTTPS.

## 12. GIT

Todo cambio debe quedar versionado.

Trabaja con commits lógicos.

No hagas commits de:

- .env;
- passwords;
- tokens;
- API keys;
- credenciales.

## 13. TESTING

Cubre como mínimo:

- autenticación;
- creación de meta;
- formulario dinámico;
- edición;
- aportes;
- retiros;
- cálculos;
- proyección;
- disciplina;
- dashboard;
- journal;
- flujos E2E principales.

Ejecuta los tests antes de marcar una fase como terminada.

## 14. SI ENCUENTRAS UN PROBLEMA

No improvises si el problema cambia la arquitectura o el producto.

Detente y reporta:

```text
BLOCKER
Reason
Affected component
Affected task
Evidence
Options
Recommended solution
```

## 15. DEFINICIÓN DE TERMINADO

Una tarea solamente está terminada cuando:

- está implementada;
- cumple acceptance criteria;
- tiene validación;
- tiene tests apropiados;
- no rompe funcionalidades existentes;
- es responsive cuando corresponde;
- no expone secretos;
- está versionada.

## 16. REPORTE FINAL

Cuando termines reporta:

```text
COMPLETED TASKS

CREATED FILES

MODIFIED FILES

DELETED FILES

ARCHITECTURE DECISIONS

DATABASE

API

TESTS EXECUTED

TEST RESULTS

ACCEPTANCE CRITERIA

DEPLOYMENT

GIT STATUS

PROBLEMS

REMAINING WORK
```

Empieza ahora por **INSPECT + ANALYZE**.

No empieces por crear componentes de negocio hasta cerrar el análisis técnico.
