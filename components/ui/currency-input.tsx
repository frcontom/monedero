"use client";

import CurrencyInput from "react-currency-input-field";
import type { CurrencyInputProps } from "react-currency-input-field";

export function MoneyInput(props: CurrencyInputProps) {
  return (
    <CurrencyInput
      intlConfig={{ locale: "es-CO", currency: "COP" }}
      allowDecimals={false}
      decimalsLimit={0}
      inputMode="numeric"
      {...props}
    />
  );
}