# ADR-004 — Dinero: enteros en unidades menores (centavos)

## Decision

Todos los montos se almacenan como **`bigint` en unidades menores** de la moneda. Prohibido float/double para dinero. **Moneda del sistema: COP (Colombia), sin decimales** → la unidad mínima es 1 peso y los valores se almacenan en pesos enteros.

## Rationale

- Evita por completo errores de precisión de coma flotante (R-003, BR monetaria del brief).
- La aritmética es entera (sin librerías decimales); el formateo se hace solo en UI con `Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits: 0 })` (ej. `$ 10.000`).
- COP no usa decimales, por lo que "unidades menores" = pesos enteros; `bigint` cubre cualquier monto personal.

## Alternatives

- `numeric(14,2)`: preciso pero devuelve strings en node-postgres y complica el cálculo en JS.
- Float: descartado explícitamente.

## Impact

- Alto: define el modelo de datos, los cálculos (ver `knowledge/domain/goals.md`) y el formato de entrada/salida de la API (JSON en centavos, formateo en cliente).

## Status

ACEPTADA.