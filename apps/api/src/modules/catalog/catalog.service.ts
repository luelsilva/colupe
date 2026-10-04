import { db, categories, subcategories, services } from "@colupe/database";
import { asc, eq } from "drizzle-orm";

export class CatalogService {
  static async getCategories() {
    return db
      .select()
      .from(categories)
      .orderBy(asc(categories.orderIndex), asc(categories.name));
  }

  static async toggleCategory(id: number) {
    const [current] = await db
      .select({ isActive: categories.isActive })
      .from(categories)
      .where(eq(categories.id, id));

    if (!current) return null;

    const [updated] = await db
      .update(categories)
      .set({
        isActive: !current.isActive,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return updated;
  }

  static async getSubcategories() {
    return db
      .select({
        id: subcategories.id,
        categoryId: subcategories.categoryId,
        slug: subcategories.slug,
        name: subcategories.name,
        description: subcategories.description,
        icon: subcategories.icon,
        isActive: subcategories.isActive,
        orderIndex: subcategories.orderIndex,
        createdAt: subcategories.createdAt,
        updatedAt: subcategories.updatedAt,
        categoryName: categories.name,
        categorySlug: categories.slug,
        categoryIsActive: categories.isActive,
      })
      .from(subcategories)
      .leftJoin(categories, eq(categories.id, subcategories.categoryId))
      .orderBy(asc(subcategories.categoryId), asc(subcategories.orderIndex));
  }

  static async toggleSubcategory(id: number) {
    const [current] = await db
      .select({ isActive: subcategories.isActive })
      .from(subcategories)
      .where(eq(subcategories.id, id));

    if (!current) return null;

    const [updated] = await db
      .update(subcategories)
      .set({
        isActive: !current.isActive,
        updatedAt: new Date(),
      })
      .where(eq(subcategories.id, id))
      .returning();

    return updated;
  }

  static async getServices() {
    return db
      .select({
        id: services.id,
        subcategoryId: services.subcategoryId,
        slug: services.slug,
        name: services.name,
        description: services.description,
        href: services.href,
        leadCostCredits: services.leadCostCredits,
        isActive: services.isActive,
        orderIndex: services.orderIndex,
        createdAt: services.createdAt,
        updatedAt: services.updatedAt,
        subcategoryName: subcategories.name,
        subcategoryIsActive: subcategories.isActive,
        categoryName: categories.name,
        categoryId: categories.id,
        categorySlug: categories.slug,
        categoryIsActive: categories.isActive,
      })
      .from(services)
      .leftJoin(subcategories, eq(subcategories.id, services.subcategoryId))
      .leftJoin(categories, eq(categories.id, subcategories.categoryId))
      .orderBy(asc(services.subcategoryId), asc(services.orderIndex));
  }

  static async toggleService(id: number) {
    const [current] = await db
      .select({ isActive: services.isActive })
      .from(services)
      .where(eq(services.id, id));

    if (!current) return null;

    const [updated] = await db
      .update(services)
      .set({
        isActive: !current.isActive,
        updatedAt: new Date(),
      })
      .where(eq(services.id, id))
      .returning();

    return updated;
  }
}
