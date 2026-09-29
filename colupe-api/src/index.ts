import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { config } from "./config/env";
import { APP_MESSAGES } from "./shared/constants/messages";
import { healthRoutes } from "./modules/health/health.routes";
import { infoRoutes } from "./modules/info/info.routes";
import { client as dbClient } from "./db";

export const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: APP_MESSAGES.SWAGGER.TITLE,
          version: APP_MESSAGES.SWAGGER.VERSION,
          description: APP_MESSAGES.SWAGGER.DESCRIPTION,
        },
        tags: [
          {
            name: APP_MESSAGES.SWAGGER.TAG_HEALTH,
            description: APP_MESSAGES.SWAGGER.TAG_HEALTH_DESC,
          },
          {
            name: APP_MESSAGES.SWAGGER.TAG_INFO,
            description: APP_MESSAGES.SWAGGER.TAG_INFO_DESC,
          },
        ],
      },
    })
  )
  .use(healthRoutes)
  .use(infoRoutes)
  .get("/swagger", ({ redirect }) => redirect("/docs", 302))
  .get("/swagger/*", ({ redirect }) => redirect("/docs", 302))
  .get("/", ({ redirect }) => redirect("/docs", 302))
  .listen(config.port);

console.log(`\n======================================================`);
console.log(APP_MESSAGES.SERVER.RUNNING);
console.log(`📡 URL Base:        http://localhost:${config.port}`);
console.log(`📑 Documentação:    http://localhost:${config.port}/docs`);
console.log(`🏥 Healthcheck:     http://localhost:${config.port}/health`);
console.log(`ℹ️  Info:            http://localhost:${config.port}/info`);
console.log(`⚙️  Ambiente:        ${config.nodeEnv}`);
console.log(`======================================================\n`);

const handleShutdown = async () => {
  console.log(`\n${APP_MESSAGES.SERVER.SHUTDOWN_SIGNAL}`);
  app.stop();
  await dbClient.end();
  console.log(APP_MESSAGES.SERVER.SHUTDOWN_SUCCESS);
  process.exit(0);
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
