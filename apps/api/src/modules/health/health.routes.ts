import { Elysia } from "elysia";
import { HealthService } from "./health.service";
import { APP_MESSAGES } from "@colupe/shared";

export const healthRoutes = new Elysia({ prefix: "/health" })
  .get(
    "/",
    () => {
      return HealthService.getHealthStatus();
    },
    {
      detail: {
        tags: [APP_MESSAGES.SWAGGER.TAG_HEALTH],
        summary: "Status de saúde do serviço",
        description: "Retorna o estado operacional, tempo de atividade e uso de memória da API.",
      },
    }
  );
