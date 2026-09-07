# ADR-001 — Stack: Next.js (App Router) + React + TypeScript en Vercel

## Decision

Usar **Next.js 15 (App Router)** con **React 19** y **TypeScript** como frontend y backend/API en un único repositorio desplegado en Vercel (Route Handlers serverless). No usar un backend separado (Express/etc.) en esta fase.

## Rationale

- Vercel es la plataforma prevista: Next.js es el framework nativo, con funciones serverless y despliegue integrado en un solo proyecto (frontend + API).
- El volumen es personal y pequeño; un monorepo único con route handlers evita infraestructura adicional (regla de simplicidad, ADR-008 del brief).
- Las credenciales de base de datos quedan solo en el servidor (env vars), nunca en el cliente.

## Alternatives

- Vite + React + API Express separada: más piezas que desplegar en Vercel, mayor complejidad sin beneficio en este tamaño.
- BaaS (Supabase/Firebase): descartado (brief §12-C) al existir PostgreSQL gestionado usable.

## Impact

- Alto: define estructura del repo, despliegue y cómo se exponen las API.
- Sustituye la mención genérica "React" del brief por un framework concreto.

## Status

ACEPTADA (pendiente confirmación final del usuario).