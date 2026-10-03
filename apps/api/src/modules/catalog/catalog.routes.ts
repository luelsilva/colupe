import { Elysia } from "elysia";
import { CatalogService } from "./catalog.service";

export const catalogRoutes = new Elysia({ prefix: "/catalog" })
  .get(
    "/categories",
    async () => {
      const data = await CatalogService.getCategories();
      return { data };
    },
    {
      detail: {
        tags: ["Catálogo"],
        summary: "Listar categorias",
        description: "Retorna todas as categorias de nível 1 ordenadas por order_index.",
      },
    }
  )
  .get(
    "/subcategories",
    async () => {
      const data = await CatalogService.getSubcategories();
      return { data };
    },
    {
      detail: {
        tags: ["Catálogo"],
        summary: "Listar subcategorias",
        description: "Retorna todas as subcategorias (nível 2) com o nome da categoria pai.",
      },
    }
  )
  .get(
    "/services",
    async () => {
      const data = await CatalogService.getServices();
      return { data };
    },
    {
      detail: {
        tags: ["Catálogo"],
        summary: "Listar serviços",
        description: "Retorna todos os serviços (nível 3) com subcategoria e categoria pai.",
      },
    }
  );
