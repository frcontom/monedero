CREATE TYPE "public"."category" AS ENUM('AHORRO', 'COMPRA', 'DEUDA', 'VIAJE', 'FONDO', 'OTRO');--> statement-breakpoint
CREATE TYPE "public"."date_mode" AS ENUM('TARGET_DATE', 'NO_DATE');--> statement-breakpoint
CREATE TYPE "public"."goal_status" AS ENUM('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('deposit', 'withdrawal');--> statement-breakpoint
CREATE TYPE "public"."periodicity" AS ENUM('DAILY', 'WEEKLY', 'MONTHLY');--> statement-breakpoint
CREATE TYPE "public"."planning_mode" AS ENUM('PERIODIC', 'FLEXIBLE');--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"target_amount" bigint NOT NULL,
	"start_date" date NOT NULL,
	"date_mode" date_mode NOT NULL,
	"target_date" date,
	"planning_mode" "planning_mode" NOT NULL,
	"periodicity" "periodicity",
	"planned_amount" bigint,
	"status" "goal_status" DEFAULT 'ACTIVE' NOT NULL,
	"category" "category" DEFAULT 'OTRO' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "goals_target_positive" CHECK ("goals"."target_amount" > 0),
	CONSTRAINT "goals_planned_positive" CHECK ("goals"."planned_amount" IS NULL OR "goals"."planned_amount" > 0),
	CONSTRAINT "goals_target_date_after_start" CHECK ("goals"."target_date" IS NULL OR "goals"."target_date" >= "goals"."start_date"),
	CONSTRAINT "goals_plan_coherence" CHECK (("goals"."planning_mode" = 'FLEXIBLE' AND "goals"."periodicity" IS NULL AND "goals"."planned_amount" IS NULL) OR ("goals"."planning_mode" = 'PERIODIC' AND "goals"."periodicity" IS NOT NULL AND "goals"."planned_amount" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "goal_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_id" uuid NOT NULL,
	"date" date NOT NULL,
	"type" "movement_type" NOT NULL,
	"amount" bigint NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "movements_amount_positive" CHECK ("goal_movements"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_movements" ADD CONSTRAINT "goal_movements_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "goals_user_id_idx" ON "goals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "movements_goal_date_idx" ON "goal_movements" USING btree ("goal_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");