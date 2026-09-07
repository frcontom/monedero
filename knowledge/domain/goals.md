# GOALS — Reglas de negocio y fórmulas

> Documento de referencia de las reglas matemáticas del dominio. Versión propuesta en REQ-20260906-001. Todas las fórmulas deben tener tests específicos.

## 1. Representación monetaria

- Todo monto se almacena como **entero en unidades menores** — `BIGINT` en la base de datos.
- Prohibido usar float/double para dinero (BR: precisión).
- **Moneda: COP (Colombia)** — sin decimales. La unidad mínima es **1 peso**; los valores se capturan/almacenan en pesos enteros.
- El formateo se hace solo en la UI con `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })` → ej. `$ 10.000` (separador de miles `.`).
- Fechas en formato `dd/mm/yyyy`.
- `movement.type ∈ {'deposit','withdrawal'}` y `amount_cents` siempre ≥ 0 (en COP: `amount_cents` = pesos enteros).

## 2. Cálculo del acumulado

```
accumulated = Σ deposits  − Σ withdrawals        (sobre todos los movimientos válidos de la meta)
remaining   = max(0, target_amount_cents − accumulated)
progress_pct = min(100, accumulated / target_amount_cents × 100)      (display)
```

- `target_amount_cents` es siempre positivo (BR-001).
- Si `target == 0` (no permitido) → progreso 0.

## 3. Referencia de expectativa (ritmo esperado)

Para poder evaluar rendimiento se necesita una referencia temporal. Hay dos modos:

### 3.1 Con fecha objetivo (sin plan periódico) — expectativa lineal

```
start      = meta.start_date
target_d   = meta.target_date            (start <= target_d)
total_days = max(1, target_d − start)
elapsed    = clamp(today − start, 0, total_days)
expected   = target_amount_cents × elapsed / total_days
```

### 3.2 Con plan periódico (da igual si hay fecha) — expectativa por periodos completos

```
period_days = DIAS(periodicity)   → DAILY=1, WEEKLY=7, MONTHLY=30.4375
periods_elapsed = floor(elapsed / period_days)
expected   = periods_elapsed × planned_amount_cents     (solo periodos completos, conservador)
```

- Si hay plan periódico se usa 3.2 (más fiel al plan). Si solo hay fecha, se usa 3.1.
- Si no hay ni fecha ni plan → **sin referencia**: no se evalúa rendimiento (se muestra estado neutro, ver §5).

## 4. Proyección

```
avg_daily_rate = accumulated / max(1, days_since_start)     (ritmo real promedio)

proj_days   = avg_daily_rate > 0 ? remaining / avg_daily_rate : null
projected_date = today + proj_days
```

- Si `avg_daily_rate <= 0` o no hay movimientos → **sin datos suficientes** (no se muestra fecha proyectada).
- La proyección SIEMPRE se etiqueta como **estimación** basada en comportamiento histórico (BR-011). Nunca como garantía.

### Equivalentes de ritmo necesario (solo con fecha objetivo futura)

El ritmo necesario por día/semana/mes solo tiene sentido cuando existe una **fecha objetivo** (y no ha pasado). Para metas sin fecha (o con fecha ya vencida) **no se calculan** (`null` en la API; la UI muestra "—" y en su lugar el plan por periodo si existe).

```
days_left      = max(1, target_d − today)
rate_daily     = remaining / days_left
rate_weekly    = rate_daily × 7
rate_monthly   = rate_daily × 30.4375
```

> Antes se usaba `days_left = 1` para metas sin fecha, produciendo valores absurdos (semana ≈ 7× y mes ≈ 30× el restante). Corregido.

## 5. Estado de rendimiento (disciplina)

Evaluable solo si existe referencia (§3). Si no hay referencia → estado neutro `SIN_REFERENCIA` (sin alerta).

```
if accumulated >= target:
    status = OBJETIVO_ALCANZADO
elif expected <= 0:
    status = EN_RITMO                       (inicio del periodo, sin expectativa acumulada)
else:
    ratio = accumulated / expected
    status = EN_RITMO           si ratio >= 0.90
    status = NECESITA_ATENCION  si 0.70 <= ratio < 0.90
    status = ATRASADA           si ratio < 0.70
```

Umbrales documentados (configurables en un único módulo de cálculo):
- `EN_RITMO` si estás a ≥90% del esperado.
- `NECESITA_ATENCION` entre 70% y 90%.
- `ATRASADA` bajo 70%.

### Déficit y recuperación

```
behind   = max(0, expected − accumulated)      (cuánto falta para volver a ritmo hoy)
recover  = behind > 0 ? behind + rate_daily : 0   (para recuperar este periodo, sumar el déficit + ritmo del día)
days_since_last_movement = today − last_movement_date
```

Mensajes accionables (data-driven, BR-012):
- ATRASADA → "Estás X detrás del ritmo. Necesitas aportar Y este periodo (incluida la cuota del periodo) para recuperarte."
- NECESITA_ATENCION → "Estás cerca del ritmo, te faltan X. Aporta Y para ponerte al día."
- EN_RITMO → "Vas en ritmo. Cuota necesaria: Y por periodo."
- OBJETIVO_ALCANZADO → "Meta alcanzada."

## 6. Completitud (BR-010)

- Rendimiento: `OBJETIVO_ALCANZADO` cuando `accumulated >= target_amount_cents`.
- Estado administrativo `COMPLETADA`: el sistema la sugiere/auto-marca cuando `OBJETIVO_ALCANZADO`. Manualmente solo puede marcarse `COMPLETADA` si `accumulated >= target`; si no, se rechaza con mensaje.
- `PAUSADA` / `CANCELADA`: manuales, permitidas sobre metas ACTIVA en cualquier momento.
- Una meta `CANCELADA` deja de contar en agregados del dashboard.

## 7. Políticas de datos

- **Movimientos**: se pueden **editar** (fecha, tipo, monto, descripción) y **eliminar** (corrección de hechos personales). No se alteran automáticamente al modificar la meta (BR-005). Timestamps `created_at`/`updated_at`.
- **Metas**: `DELETE /api/goals/[id]` **elimina por completo** la meta y sus movimientos (FK en cascada). No se puede deshacer. El estado `CANCELLED` se usa solo como estado administrativo/archivo explícito (pausa definitiva sin borrar), no como borrado.
- **Modificación de meta**: cambiar objetivo/fechas/plan no reescribe movimientos; recalcula solo expectativas futuras con la configuración vigente.

## 8. Configuración funcional de la meta (campos)

Obligatorios según modalidad (ADR campos completos):
- Siempre: `name`, `target_amount_cents > 0`, `start_date`, `date_mode ∈ {TARGET_DATE, NO_DATE}`, `planning_mode ∈ {PERIODIC, FLEXIBLE}`, `status`, `category`.
- Si `date_mode = TARGET_DATE` → obligatorio `target_date >= start_date`.
- Si `planning_mode = PERIODIC` → obligatorio `periodicity ∈ {DAILY, WEEKLY, MONTHLY}` y `planned_amount_cents > 0`.
- Si el modo cambia (TARGET_DATE→NO_DATE o PERIODIC→FLEXIBLE), los campos dependientes se **limpian/invalidan** (CLEAR/INVALIDATE) antes de guardar (BR-008).
- `category ∈ {AHORRO, COMPRA, DEUDA, VIAJE, FONDO, OTRO}` (enum, por defecto OTRO).
- `description` libre opcional (no funcional).

## 9. Periodicidad personalizada

Descartada para el MVP (`DAILY/WEEKLY/MONTHLY`). Evaluable post-MVP si hay necesidad real.

## 10. Agregados del dashboard

Sobre metas no `CANCELADA`:
- total_metas, total_objetivo = Σ target, total_acumulado = Σ accumulated, total_pendiente = Σ remaining.
- progreso_global = Σ accumulated / Σ target × 100.
- completadas (estado COMPLETADA), en_riesgo (ATRASADA o NECESITA_ATENCION), actividad reciente (últimos movimientos).