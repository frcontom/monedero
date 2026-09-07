export const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activa",
  PAUSED: "Pausada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export const PERFORMANCE_LABEL: Record<string, string> = {
  EN_RITMO: "En ritmo",
  NECESITA_ATENCION: "Necesita atención",
  ATRASADA: "Atrasada",
  OBJETIVO_ALCANZADO: "Objetivo alcanzado",
  SIN_REFERENCIA: "Sin referencia",
};

export const PERFORMANCE_COLOR: Record<string, string> = {
  EN_RITMO: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  NECESITA_ATENCION: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  ATRASADA: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  OBJETIVO_ALCANZADO: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  SIN_REFERENCIA: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export const CATEGORY_LABEL: Record<string, string> = {
  AHORRO: "Ahorro",
  COMPRA: "Compra",
  DEUDA: "Deuda",
  VIAJE: "Viaje",
  FONDO: "Fondo",
  OTRO: "Otro",
};

export const PERIODICITY_LABEL: Record<string, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
};