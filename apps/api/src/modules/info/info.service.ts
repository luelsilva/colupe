import { config } from "../../config/env";
import { APP_MESSAGES } from "@colupe/shared";

export class InfoService {
  public static getAppInfo() {
    return {
      name: config.appName,
      environment: config.nodeEnv,
      version: APP_MESSAGES.SWAGGER.VERSION,
      runtime: `Bun ${Bun.version}`,
    };
  }
}
