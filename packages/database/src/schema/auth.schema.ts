import {
  pgTable,
  text,
  timestamp,
  bigint,
  bigserial,
  boolean,
  integer,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { profiles } from "./users.schema";

export const otpTypeEnum = pgEnum("otp_type", ["registration", "password_reset"]);

export const otpCodes = pgTable("otp_codes", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  type: otpTypeEnum("type").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  isRevoked: boolean("is_revoked").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: bigint("user_id", { mode: "number" }).references(() => profiles.id, {
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
