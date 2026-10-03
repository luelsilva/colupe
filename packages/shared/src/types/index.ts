export type UserRole = "admin" | "professional" | "client";

export type ProfessionalStatus = "pending" | "verified" | "rejected" | "suspended";

export type RequestStatus = "open" | "in_progress" | "completed" | "cancelled" | "expired";

export type LeadUnlockStatus = "unlocked" | "contacted" | "hired" | "declined";

export type TransactionType = "purchase" | "lead_unlock" | "refund" | "bonus" | "admin_adjustment";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
