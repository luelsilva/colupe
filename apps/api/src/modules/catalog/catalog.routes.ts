import { Elysia, t } from "elysia";
import { CatalogService } from "./catalog.service";
import { APP_ERRORS } from "@colupe/shared";

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
  .patch(
    "/categories/:id/toggle",
    async ({ params, set }) => {
      const id = Number(params.id);
      const data = await CatalogService.toggleCategory(id);
      if (!data) {
        set.status = 404;
        return { error: APP_ERRORS.CATEGORY_NOT_FOUND };
      }
      return { data };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        tags: ["Catálogo"],
        summary: "Ativar/Desativar categoria",
        description: "Alterna o status isActive da categoria informada.",
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
  .patch(
    "/subcategories/:id/toggle",
    async ({ params, set }) => {
      const id = Number(params.id);
      const data = await CatalogService.toggleSubcategory(id);
      if (!data) {
        set.status = 404;
        return { error: APP_ERRORS.SUBCATEGORY_NOT_FOUND };
      }
      return { data };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        tags: ["Catálogo"],
        summary: "Ativar/Desativar subcategoria",
        description: "Alterna o status isActive da subcategoria informada.",
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
  )
  .patch(
    "/services/:id/toggle",
    async ({ params, set }) => {
      const id = Number(params.id);
      const data = await CatalogService.toggleService(id);
      if (!data) {
        set.status = 404;
        return { error: APP_ERRORS.SERVICE_NOT_FOUND };
      }
      return { data };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        tags: ["Catálogo"],
        summary: "Ativar/Desativar serviço",
        description: "Alterna o status isActive do serviço informado.",
      },
    }
  )
  .get(
    "/packages",
    async () => {
      const data = await CatalogService.getPackages();
      return { data };
    },
    {
      detail: {
        tags: ["Catálogo"],
        summary: "Listar pacotes de créditos",
        description: "Retorna todos os pacotes ativos de Colupas disponíveis para compra.",
      },
    }
  );
