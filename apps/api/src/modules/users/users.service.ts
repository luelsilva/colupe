import { db, profiles } from "@colupe/database";
import { APP_ERRORS } from "@colupe/shared";
import { eq } from "drizzle-orm";

export class UsersService {
  static async getById(id: number) {
    const [user] = await db
      .select({
        id: profiles.id,
        email: profiles.email,
        fullName: profiles.fullName,
        phone: profiles.phone,
        avatarUrl: profiles.avatarUrl,
        role: profiles.role,
        isVerified: profiles.isVerified,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);

    if (!user) {
      throw new Error(APP_ERRORS.NOT_FOUND);
    }

    return user;
  }
}
