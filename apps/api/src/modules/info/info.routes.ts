import { Elysia } from "elysia";
import { InfoService } from "./info.service";
import { APP_MESSAGES } from "@colupe/shared";

export const infoRoutes = new Elysia({ prefix: "/info" })
  .get(
    "/",
    () => {
      return InfoService.getAppInfo();
    },
    {
      detail: {
        tags: [APP_MESSAGES.SWAGGER.TAG_INFO],
        summary: "Informações gerais da aplicação",
        description: "Retorna metadados como nome, ambiente e versão do runtime Bun.",
      },
    }
  );
