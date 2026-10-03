import { db, profiles } from "@colupe/database";
import { APP_ERRORS } from "@colupe/shared";
import { eq } from "drizzle-orm";

export class AuthService {
  static async login(email: string) {
    const [user] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);

    if (!user) {
      throw new Error(APP_ERRORS.INVALID_CREDENTIALS);
    }

    return { user };
  }
}
