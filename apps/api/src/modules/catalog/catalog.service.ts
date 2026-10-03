import { db, categories, subcategories, services } from "@colupe/database";
import { asc, eq } from "drizzle-orm";

export class CatalogService {
  static async getCategories() {
    return db
      .select()
      .from(categories)
      .orderBy(asc(categories.orderIndex), asc(categories.name));
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
      })
      .from(subcategories)
      .leftJoin(categories, eq(categories.id, subcategories.categoryId))
      .orderBy(asc(subcategories.categoryId), asc(subcategories.orderIndex));
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
        categoryName: categories.name,
      })
      .from(services)
      .leftJoin(subcategories, eq(subcategories.id, services.subcategoryId))
      .leftJoin(categories, eq(categories.id, subcategories.categoryId))
      .orderBy(asc(services.subcategoryId), asc(services.orderIndex));
  }
}
