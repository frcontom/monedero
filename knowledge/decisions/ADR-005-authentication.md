# ADR-005 — Autenticación: Auth.js (NextAuth v5) con credenciales

## Decision

Usar **Auth.js v5 (NextAuth)** con **Credentials provider**, contraseña hasheada con **bcrypt**, estrategia de sesión **JWT** en cookie `httpOnly`, y protección de rutas/API vía `auth()`/middleware. Único usuario para el MVP con separación lógica por `user_id`.

## Rationale

- Auth.js es una implementación mantenida y probada; gestiona CSRF en sus endpoints, cookies seguras y sesión JWT sin infraestructura extra.
- bcrypt cumple el requisito de hash seguro.
- Mantiene la separación por `user_id` para evolución a multiusuario (ADR-001 del brief).

## Alternatives

- Sesión custom (jose + cookie): menos dependencias pero mayor riesgo de errores de seguridad (CSRF, expiración) sin beneficio claro para un usuario.
- JWT manual de terceros: innecesario.

## Impact

- Medio: define login/logout/sesión actual, hash, protección de rutas y `rate limiting` simple en login.

## Status

PROPUESTA (pendiente confirmación).