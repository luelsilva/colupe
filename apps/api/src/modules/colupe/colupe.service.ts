import { db, serviceRequests } from "@colupe/database";
import { desc } from "drizzle-orm";

export class ColupeService {
  static async listRecentRequests(limit = 20) {
    return db
      .select()
      .from(serviceRequests)
      .orderBy(desc(serviceRequests.createdAt))
      .limit(limit);
  }
}
