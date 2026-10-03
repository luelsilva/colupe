import * as authSchema from "./auth.schema";
import * as usersSchema from "./users.schema";
import * as colupeSchema from "./colupe.schema";

export * from "./auth.schema";
export * from "./users.schema";
export * from "./colupe.schema";

// Type Inferences
export type Profile = typeof usersSchema.profiles.$inferSelect;
export type NewProfile = typeof usersSchema.profiles.$inferInsert;

export type Category = typeof colupeSchema.categories.$inferSelect;
export type NewCategory = typeof colupeSchema.categories.$inferInsert;

export type Subcategory = typeof colupeSchema.subcategories.$inferSelect;
export type NewSubcategory = typeof colupeSchema.subcategories.$inferInsert;

export type Service = typeof colupeSchema.services.$inferSelect;
export type NewService = typeof colupeSchema.services.$inferInsert;

export type ProfessionalProfile = typeof usersSchema.professionalProfiles.$inferSelect;
export type NewProfessionalProfile = typeof usersSchema.professionalProfiles.$inferInsert;

export type ServiceRequest = typeof colupeSchema.serviceRequests.$inferSelect;
export type NewServiceRequest = typeof colupeSchema.serviceRequests.$inferInsert;

export type LeadUnlock = typeof colupeSchema.leadUnlocks.$inferSelect;
export type NewLeadUnlock = typeof colupeSchema.leadUnlocks.$inferInsert;

export type Review = typeof colupeSchema.reviews.$inferSelect;
export type NewReview = typeof colupeSchema.reviews.$inferInsert;

export type CreditPackage = typeof colupeSchema.creditPackages.$inferSelect;
export type CreditTransaction = typeof colupeSchema.creditTransactions.$inferSelect;
