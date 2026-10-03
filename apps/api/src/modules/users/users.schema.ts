import { t } from "elysia";

export const updateUserSchema = t.Object({
  fullName: t.Optional(t.String({ minLength: 2 })),
  phone: t.Optional(t.String()),
  avatarUrl: t.Optional(t.String()),
});
