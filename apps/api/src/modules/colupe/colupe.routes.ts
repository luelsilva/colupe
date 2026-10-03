import { Elysia } from "elysia";
import { ColupeService } from "./colupe.service";
import { APP_MESSAGES } from "@colupe/shared";

export const colupeRoutes = new Elysia({ prefix: "/requests" })
  .get(
    "/",
    async () => {
      const requests = await ColupeService.listRecentRequests();
      return { data: requests };
    },
    {
      detail: {
        tags: [APP_MESSAGES.SWAGGER.TAG_REQUESTS],
        summary: "Listar pedidos recentes",
        description: "Retorna a listagem de pedidos de serviços disponíveis.",
      },
    }
  );
