import { Elysia } from "elysia";
import { ColupeService } from "./colupe.service";
import { createServiceRequestSchema } from "./colupe.schema";
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
  )
  .post(
    "/",
    async ({ body }) => {
      const created = await ColupeService.createServiceRequest({
        ...body,
        serviceId: Number(body.serviceId),
      });
      return { data: created };
    },
    {
      body: createServiceRequestSchema,
      detail: {
        tags: [APP_MESSAGES.SWAGGER.TAG_REQUESTS],
        summary: "Criar solicitação de serviço",
        description: "Publica um novo pedido de serviço para os profissionais cadastrados.",
      },
    }
  );
