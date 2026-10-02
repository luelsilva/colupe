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
  primaryKey,
} from "drizzle-orm/pg-core";

/**
 * ==============================================================================
 * ENUMs do Domínio Colupe
 * ==============================================================================
 */
export const otpTypeEnum = pgEnum("otp_type", ["registration", "password_reset"]);
export const userRoleEnum = pgEnum("user_role", ["admin", "professional", "client"]);
export const professionalStatusEnum = pgEnum("professional_status", [
  "pending",
  "verified",
  "rejected",
  "suspended",
]);
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
 * ==============================================================================
 * Tabelas de Sistema e Snowflake ID
 * ==============================================================================
 */
export const snowflakeState = pgTable("snowflake_state", {
  workerId: integer("worker_id").primaryKey(),
  lastMs: bigint("last_ms", { mode: "bigint" }).notNull().default(0n),
  sequence: integer("sequence").notNull().default(-1),
});

export const keepAlive = pgTable("keep_alive", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/**
 * ==============================================================================
 * Usuários Base: profiles
 * ==============================================================================
 */
export const profiles = pgTable("profiles", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  isVerified: boolean("is_verified").notNull().default(false),
  role: text("role").notNull().default("client"), // 'admin' | 'professional' | 'client'
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

/**
 * ==============================================================================
 * Categorias e Catálogo de Serviços
 * ==============================================================================
 */
// Nível 1 — Categorias principais
export const categories = pgTable("categories", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
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

// Nível 2 — Subcategorias (grupos temáticos)
export const subcategories = pgTable("subcategories", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  categoryId: bigint("category_id", { mode: "bigint" })
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

// Nível 3 — Serviços individuais (itens folha)
export const services = pgTable("services", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  subcategoryId: bigint("subcategory_id", { mode: "bigint" })
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
 * ==============================================================================
 * Perfis Profissionais e Portfólio
 * ==============================================================================
 */
export const professionalProfiles = pgTable("professional_profiles", {
  id: bigint("id", { mode: "bigint" })
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  documentType: text("document_type").notNull().default("CPF"),
  documentNumber: text("document_number").notNull().unique(),
  companyName: text("company_name"),
  whatsapp: text("whatsapp").notNull(),
  bio: text("bio"),
  experienceYears: integer("experience_years").default(0),
  city: text("city").notNull(),
  state: text("state").notNull(),
  neighborhood: text("neighborhood"),
  serviceRadiusKm: integer("service_radius_km").notNull().default(30),
  status: professionalStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  creditsBalance: integer("credits_balance").notNull().default(20),
  ratingAvg: numeric("rating_avg", { precision: 3, scale: 2 }).notNull().default("0.00"),
  ratingCount: integer("rating_count").notNull().default(0),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const professionalServices = pgTable(
  "professional_services",
  {
    professionalId: bigint("professional_id", { mode: "bigint" })
      .notNull()
      .references(() => professionalProfiles.id, { onDelete: "cascade" }),
    serviceId: bigint("service_id", { mode: "bigint" })
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.professionalId, t.serviceId] })]
);

export const professionalPortfolio = pgTable("professional_portfolio", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  professionalId: bigint("professional_id", { mode: "bigint" })
    .notNull()
    .references(() => professionalProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * ==============================================================================
 * Solicitações de Serviços (Pedidos / Leads)
 * ==============================================================================
 */
export const serviceRequests = pgTable("service_requests", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  clientId: bigint("client_id", { mode: "bigint" })
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  serviceId: bigint("service_id", { mode: "bigint" })
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
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  requestId: bigint("request_id", { mode: "bigint" })
    .notNull()
    .references(() => serviceRequests.id, { onDelete: "cascade" }),
  professionalId: bigint("professional_id", { mode: "bigint" })
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
 * ==============================================================================
 * Avaliações (Reviews)
 * ==============================================================================
 */
export const reviews = pgTable("reviews", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  requestId: bigint("request_id", { mode: "bigint" })
    .notNull()
    .references(() => serviceRequests.id, { onDelete: "cascade" }),
  clientId: bigint("client_id", { mode: "bigint" })
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  professionalId: bigint("professional_id", { mode: "bigint" })
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
 * ==============================================================================
 * Moedas / Créditos e Transações
 * ==============================================================================
 */
export const creditPackages = pgTable("credit_packages", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  name: text("name").notNull(),
  creditsAmount: integer("credits_amount").notNull(),
  bonusCredits: integer("bonus_credits").notNull().default(0),
  priceCents: integer("price_cents").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const creditTransactions = pgTable("credit_transactions", {
  id: bigint("id", { mode: "bigint" }).primaryKey(),
  professionalId: bigint("professional_id", { mode: "bigint" })
    .notNull()
    .references(() => professionalProfiles.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  type: transactionTypeEnum("type").notNull(),
  description: text("description").notNull(),
  referenceId: bigint("reference_id", { mode: "bigint" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * ==============================================================================
 * Autenticação, Tokens & Auditoria
 * ==============================================================================
 */
export const otpCodes = pgTable("otp_codes", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: bigint("user_id", { mode: "bigint" })
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  type: otpTypeEnum("type").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: bigint("user_id", { mode: "bigint" })
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  isRevoked: boolean("is_revoked").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: bigint("user_id", { mode: "bigint" }).references(() => profiles.id, {
    onDelete: "set null",
  }),
  action: text("action").notNull(),
  sourceApp: text("source_app").notNull().default("colupe"),
  ipAddress: text("ip_address"),
  ipPort: integer("ip_port"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Inferência de Tipos TypeScript
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Subcategory = typeof subcategories.$inferSelect;
export type NewSubcategory = typeof subcategories.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type ProfessionalProfile = typeof professionalProfiles.$inferSelect;
export type NewProfessionalProfile = typeof professionalProfiles.$inferInsert;

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type NewServiceRequest = typeof serviceRequests.$inferInsert;

export type LeadUnlock = typeof leadUnlocks.$inferSelect;
export type NewLeadUnlock = typeof leadUnlocks.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type CreditPackage = typeof creditPackages.$inferSelect;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
