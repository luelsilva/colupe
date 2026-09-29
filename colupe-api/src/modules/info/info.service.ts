import { config } from "../../config/env";
import { APP_MESSAGES } from "../../shared/constants/messages";

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
