import { db, serviceRequests, creditPackages, services, profiles } from "@colupe/database";
import { desc, asc, eq } from "drizzle-orm";

export class ColupeService {
  static async listRecentRequests(limit = 20) {
    return db
      .select({
        id: serviceRequests.id,
        clientId: serviceRequests.clientId,
        serviceId: serviceRequests.serviceId,
        serviceName: services.name,
        leadCostCredits: services.leadCostCredits,
        title: serviceRequests.title,
        description: serviceRequests.description,
        city: serviceRequests.city,
        state: serviceRequests.state,
        neighborhood: serviceRequests.neighborhood,
        addressMasked: serviceRequests.addressMasked,
        addressFull: serviceRequests.addressFull,
        urgency: serviceRequests.urgency,
        budgetRange: serviceRequests.budgetRange,
        maxUnlocks: serviceRequests.maxUnlocks,
        unlocksCount: serviceRequests.unlocksCount,
        status: serviceRequests.status,
        createdAt: serviceRequests.createdAt,
      })
      .from(serviceRequests)
      .leftJoin(services, eq(services.id, serviceRequests.serviceId))
      .orderBy(desc(serviceRequests.createdAt))
      .limit(limit);
  }

  static async getCreditPackages() {
    return db
      .select()
      .from(creditPackages)
      .where(eq(creditPackages.isActive, true))
      .orderBy(asc(creditPackages.orderIndex));
  }

  static async createServiceRequest(input: {
    serviceId: number;
    title: string;
    description: string;
    city: string;
    state: string;
    neighborhood?: string;
    addressFull: string;
    urgency?: string;
    budgetRange?: string;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
  }) {
    let clientProfileId: number;
    const email = input.clientEmail?.trim().toLowerCase() || `cliente_${Date.now()}@colupe.local`;

    const [existing] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);

    if (existing) {
      clientProfileId = existing.id;
    } else {
      const [newProfile] = await db
        .insert(profiles)
        .values({
          email,
          passwordHash: "guest_request",
          fullName: input.clientName || "Cliente",
          phone: input.clientPhone,
          role: "client",
        })
        .returning({ id: profiles.id });
      clientProfileId = newProfile.id;
    }

    const [created] = await db
      .insert(serviceRequests)
      .values({
        clientId: clientProfileId,
        serviceId: input.serviceId,
        title: input.title,
        description: input.description,
        city: input.city,
        state: input.state,
        neighborhood: input.neighborhood,
        addressFull: input.addressFull,
        urgency: input.urgency || "medium",
        budgetRange: input.budgetRange,
      })
      .returning();

    return created;
  }
}
