import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  bigint,
  bigserial,
  boolean,
  integer,
  numeric,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { profiles, professionalProfiles } from "./users.schema";

export const requestStatusEnum = pgEnum("request_status", [
  "open",
  "in_progress",
  "completed",
  "cancelled",
  "expired",
]);

export const leadUnlockStatusEnum = pgEnum("lead_unlock_status", [
  "unlocked",
  "contacted",
  "hired",
  "declined",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "purchase",
  "lead_unlock",
  "refund",
  "bonus",
  "admin_adjustment",
]);

/**
 * Tabelas de Sistema e Snowflake ID
 */
export const snowflakeState = pgTable("snowflake_state", {
  workerId: integer("worker_id").primaryKey(),
  lastMs: bigint("last_ms", { mode: "number" }).notNull().default(0),
  sequence: integer("sequence").notNull().default(-1),
});

export const keepAlive = pgTable("keep_alive", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * Categorias e Catálogo de Serviços
 */
export const categories = pgTable("categories", {
  id: bigint("id", { mode: "number" }).primaryKey().default(sql`snowflake_id()`),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const subcategories = pgTable("subcategories", {
  id: bigint("id", { mode: "number" }).primaryKey().default(sql`snowflake_id()`),
  categoryId: bigint("category_id", { mode: "number" })
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  isActive: boolean("is_active").notNull().default(true),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: bigint("id", { mode: "number" }).primaryKey().default(sql`snowflake_id()`),
  subcategoryId: bigint("subcategory_id", { mode: "number" })
    .notNull()
    .references(() => subcategories.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  href: text("href"),
  leadCostCredits: integer("lead_cost_credits").notNull().default(10),
  formSchema: jsonb("form_schema"),
  isActive: boolean("is_active").notNull().default(true),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Solicitações de Serviços (Pedidos / Leads)
 */
export const serviceRequests = pgTable("service_requests", {
  id: bigint("id", { mode: "number" }).primaryKey().default(sql`snowflake_id()`),
  clientId: bigint("client_id", { mode: "number" })
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  serviceId: bigint("service_id", { mode: "number" })
    .notNull()
    .references(() => services.id, { onDelete: "restrict" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  answersJson: jsonb("answers_json").notNull().default({}),
  photosUrls: text("photos_urls").array(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  neighborhood: text("neighborhood"),
  addressMasked: text("address_masked"),
  addressFull: text("address_full").notNull(),
  urgency: text("urgency").notNull().default("medium"),
  budgetRange: text("budget_range"),
  maxUnlocks: integer("max_unlocks").notNull().default(4),
  unlocksCount: integer("unlocks_count").notNull().default(0),
  status: requestStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const leadUnlocks = pgTable("lead_unlocks", {
  id: bigint("id", { mode: "number" }).primaryKey().default(sql`snowflake_id()`),
  requestId: bigint("request_id", { mode: "number" })
    .notNull()
    .references(() => serviceRequests.id, { onDelete: "cascade" }),
  professionalId: bigint("professional_id", { mode: "number" })
    .notNull()
    .references(() => professionalProfiles.id, { onDelete: "cascade" }),
  creditsSpent: integer("credits_spent").notNull(),
  status: leadUnlockStatusEnum("status").notNull().default("unlocked"),
  notes: text("notes"),
  unlockedAt: timestamp("unlocked_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Avaliações (Reviews)
 */
export const reviews = pgTable("reviews", {
  id: bigint("id", { mode: "number" }).primaryKey().default(sql`snowflake_id()`),
  requestId: bigint("request_id", { mode: "number" })
    .notNull()
    .references(() => serviceRequests.id, { onDelete: "cascade" }),
  clientId: bigint("client_id", { mode: "number" })
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  professionalId: bigint("professional_id", { mode: "number" })
    .notNull()
    .references(() => professionalProfiles.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  responseComment: text("response_comment"),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Colupas (Créditos da Plataforma) e Transações
 */
export const creditPackages = pgTable("credit_packages", {
  id: bigint("id", { mode: "number" }).primaryKey().default(sql`snowflake_id()`),
  name: text("name").notNull(),
  creditsAmount: integer("credits_amount").notNull(),
  bonusCredits: integer("bonus_credits").notNull().default(0),
  priceCents: integer("price_cents").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const creditTransactions = pgTable("credit_transactions", {
  id: bigint("id", { mode: "number" }).primaryKey().default(sql`snowflake_id()`),
  professionalId: bigint("professional_id", { mode: "number" })
    .notNull()
    .references(() => professionalProfiles.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  type: transactionTypeEnum("type").notNull(),
  description: text("description").notNull(),
  referenceId: bigint("reference_id", { mode: "number" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
