import { t } from "elysia";

export const createServiceRequestSchema = t.Object({
  serviceId: t.Numeric(),
  title: t.String({ minLength: 3 }),
  description: t.String({ minLength: 5 }),
  city: t.String(),
  state: t.String(),
  neighborhood: t.Optional(t.String()),
  addressFull: t.String(),
  urgency: t.Optional(t.String()),
  budgetRange: t.Optional(t.String()),
  clientName: t.Optional(t.String()),
  clientEmail: t.Optional(t.String()),
  clientPhone: t.Optional(t.String()),
});
