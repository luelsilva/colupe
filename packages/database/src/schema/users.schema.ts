import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  bigint,
  boolean,
  integer,
  numeric,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { services } from "./colupe.schema";

export const userRoleEnum = pgEnum("user_role", ["admin", "professional", "client"]);

export const professionalStatusEnum = pgEnum("professional_status", [
  "pending",
  "verified",
  "rejected",
  "suspended",
]);

export const profiles = pgTable("profiles", {
  id: bigint("id", { mode: "number" }).primaryKey().default(sql`snowflake_id()`),
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

export const professionalProfiles = pgTable("professional_profiles", {
  id: bigint("id", { mode: "number" })
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
    professionalId: bigint("professional_id", { mode: "number" })
      .notNull()
      .references(() => professionalProfiles.id, { onDelete: "cascade" }),
    serviceId: bigint("service_id", { mode: "number" })
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.professionalId, t.serviceId] })]
);

export const professionalPortfolio = pgTable("professional_portfolio", {
  id: bigint("id", { mode: "number" }).primaryKey().default(sql`snowflake_id()`),
  professionalId: bigint("professional_id", { mode: "number" })
    .notNull()
    .references(() => professionalProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
