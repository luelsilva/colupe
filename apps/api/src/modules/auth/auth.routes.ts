import { Elysia } from "elysia";
import { AuthService } from "./auth.service";
import { loginSchema } from "./auth.schema";
import { APP_MESSAGES } from "@colupe/shared";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post(
    "/login",
    async ({ body }) => {
      return AuthService.login(body.email);
    },
    {
      body: loginSchema,
      detail: {
        tags: [APP_MESSAGES.SWAGGER.TAG_AUTH],
        summary: "Login de usuário",
        description: "Autenticação por e-mail e senha.",
      },
    }
  );
