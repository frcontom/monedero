# Project

## Purpose

Aplicación web personal (PWA, mobile-first) para gestionar metas financieras: registrar movimientos de dinero, visualizar progreso, proyectar cumplimiento y reforzar disciplina de ahorro. Nombre provisional: MetaSave / Goal Journal (nombre final abierto).

## Relevant Information

- Especificación funcional aprobada: `docs/implementation-brief.md`.
- Instrucciones de implementación: `docs/opencode-prompt.md`.
- Flujo de ingeniería: ver `.ai/core/*` y `README.md`.
- Repositorio: `https://github.com/frcontom/monedero.git` (branch `main`).
- Un único usuario para el MVP; datos separados por `user_id` para evolución futura (ADR-001 del brief).

## Rules

- React (Next.js App Router) — ADR-001.
- Git obligatorio, Vercel para despliegue.
- Responsive 100%, mobile-first, PWA instalable.
- No exponer la base de datos al navegador.
- Formulario de meta dinámico y modal reutilizable para crear/editar.
- No sobreescribir historial financiero.
- Sin infraestructura innecesaria (no microservicios/Redis/Kafka/K8s).

## Notes

- La base de datos real es Neon PostgreSQL (no Namecheap) — ADR-002.
- Credenciales solo en `.env` (gitignored) y variables de entorno de Vercel.