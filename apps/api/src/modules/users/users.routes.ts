import { Elysia, t } from "elysia";
import { UsersService } from "./users.service";
import { APP_MESSAGES } from "@colupe/shared";

export const usersRoutes = new Elysia({ prefix: "/users" })
  .get(
    "/:id",
    async ({ params: { id } }) => {
      return UsersService.getById(Number(id));
    },
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      detail: {
        tags: [APP_MESSAGES.SWAGGER.TAG_AUTH],
        summary: "Obter perfil por ID",
        description: "Retorna os dados públicos do perfil de um usuário.",
      },
    }
  );
