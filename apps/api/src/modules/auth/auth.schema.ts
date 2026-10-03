import { t } from "elysia";

export const loginSchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 6 }),
});

export const registerSchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 6 }),
  fullName: t.String({ minLength: 2 }),
  phone: t.Optional(t.String()),
  role: t.Optional(t.Union([t.Literal("client"), t.Literal("professional")])),
});
