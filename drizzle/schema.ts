import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const dateModeEnum = pgEnum("date_mode", ["TARGET_DATE", "NO_DATE"]);
export const planningModeEnum = pgEnum("planning_mode", ["PERIODIC", "FLEXIBLE"]);
export const periodicityEnum = pgEnum("periodicity", ["DAILY", "WEEKLY", "MONTHLY"]);
export const goalStatusEnum = pgEnum("goal_status", ["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]);
export const categoryEnum = pgEnum("category", ["AHORRO", "COMPRA", "DEUDA", "VIAJE", "FONDO", "OTRO"]);
export const movementTypeEnum = pgEnum("movement_type", ["deposit", "withdrawal"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("users_email_unique").on(t.email)],
);

export const goals = pgTable(
  "goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    targetAmount: bigint("target_amount", { mode: "number" }).notNull(),
    startDate: date("start_date").notNull(),
    dateMode: dateModeEnum("date_mode").notNull(),
    targetDate: date("target_date"),
    planningMode: planningModeEnum("planning_mode").notNull(),
    periodicity: periodicityEnum("periodicity"),
    plannedAmount: bigint("planned_amount", { mode: "number" }),
    status: goalStatusEnum("status").notNull().default("ACTIVE"),
    category: categoryEnum("category").notNull().default("OTRO"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("goals_user_id_idx").on(t.userId),
    check("goals_target_positive", sql`${t.targetAmount} > 0`),
    check(
      "goals_planned_positive",
      sql`${t.plannedAmount} IS NULL OR ${t.plannedAmount} > 0`,
    ),
    check(
      "goals_target_date_after_start",
      sql`${t.targetDate} IS NULL OR ${t.targetDate} >= ${t.startDate}`,
    ),
    check(
      "goals_plan_coherence",
      sql`(${t.planningMode} = 'FLEXIBLE' AND ${t.periodicity} IS NULL AND ${t.plannedAmount} IS NULL) OR (${t.planningMode} = 'PERIODIC' AND ${t.periodicity} IS NOT NULL AND ${t.plannedAmount} IS NOT NULL)`,
    ),
  ],
);

export const movements = pgTable(
  "goal_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    type: movementTypeEnum("type").notNull(),
    amount: bigint("amount", { mode: "number" }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("movements_goal_date_idx").on(t.goalId, t.date),
    check("movements_amount_positive", sql`${t.amount} > 0`),
  ],
);

export type User = typeof users.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type Movement = typeof movements.$inferSelect;