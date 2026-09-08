# PLAN

```yaml
request_id: REQ-20260907-001
status: READY
```

## Decision
Implementar las 3 mejoras priorizadas. Stack actual (Next 16 + Neon + Drizzle + Auth.js v5 + Recharts + Tailwind) se mantiene. Push con `web-push` + Vercel Cron; categorías con nueva tabla `categories` y cambio de `goals.category` a texto.

## Implementation Order

1. **Migración categorías**: tabla `categories` (user_id, name, color, icon) + `goals.category` de enum → text; seed de 6 categorías por defecto por usuario.
2. **API categorías**: CRUD + listado con defaults; formulario de meta usa categorías del usuario.
3. **Exportación**: `GET /api/export?type=goals|movements&format=csv|json` + botones en configuración.
4. **Rachas**: cálculo de racha actual/máxima (días con aporte) en dashboard + detalle.
5. **Heatmap**: endpoint agregado por día (últimas ~16 semanas) + grid estilo GitHub en Journal.
6. **Escenarios**: simulador en el detalle (monto adicional/mes → fecha proyectada recalculada en cliente).
7. **Analítica por categoría**: agregación de aportes/retiros por categoría (global).
8. **Push**: VAPID, tabla `push_subscriptions`, endpoints de suscripción/activación, SW push handler, cron Vercel de recordatorios.

## Tasks
- Categorías: migración + repo + routes + UI (modal gestión + formulario).
- Export: route + UI.
- Rachas: cálculo en repo/dashboard + UI.
- Heatmap: route + componente.
- Escenarios: componente cliente.
- Analítica categorías: route + UI.
- Push: lib push + suscripción + SW + cron + UI toggle.

## Final Gate
`status: READY` → implementar task por task, verificar con typecheck/lint/test/build/e2e y commit/push al final.