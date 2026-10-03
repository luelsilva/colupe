import { APP_MESSAGES } from "@colupe/shared";

export class HealthService {
  public static getHealthStatus() {
    const memory = process.memoryUsage();
    return {
      status: "ok" as const,
      message: APP_MESSAGES.HEALTH.OK,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      memory: {
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
      },
    };
  }
}
