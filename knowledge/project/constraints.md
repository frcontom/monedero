# Constraints

## Purpose

Restricciones del proyecto monedero.

## Relevant Information

- React (Next.js App Router).
- Git obligatorio; despliegue en Vercel.
- Responsive 100% y mobile-first (móvil pequeño → desktop).
- PWA instalable (manifest + iconos + SW mínimo).
- Base de datos relacional remota (Neon PostgreSQL) — nunca expuesta al navegador.
- Un único usuario en el MVP, con separación lógica por `user_id`.
- Todos los campos funcionales aplicables son obligatorios.
- Formulario de meta dinámico y modal reutilizable para crear/editar.
- No sobreescribir historial financiero.
- No float para dinero.
- Sin infraestructura innecesaria (no microservicios/Redis/Kafka/K8s).
- Proyecciones siempre etiquetadas como estimaciones.
- Secretos únicamente por variables de entorno; jamás en Git.

## Rules

- Antes de guardar una meta, validar coherencia completa de configuración (BR-008).
- Autorización en cada operación (incluso con un único usuario).

## Notes

- Pendiente confirmar moneda/locale y detalles del proyecto Vercel (dominio).