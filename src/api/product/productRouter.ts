import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import {
  ProductSchema,
  CreateProductRequestSchema,
  UpdateProductRequestSchema,
  GetProductSchema,
  UpdateProductSchema,
  ProductListResponseSchema,
  CreateProductSchema,
  ProductQuerySchema,
} from "./productModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { productController } from "./productController";

export const productRegistry = new OpenAPIRegistry();
export const productRouter: Router = express.Router();

productRegistry.register("Product", ProductSchema);

// CREATE
productRegistry.registerPath({
  method: "post",
  path: "/products",
  tags: ["Product"],
  request: { body: { content: { "application/json": { schema: CreateProductSchema} } } },
  responses: createApiResponse(ProductSchema, "Success"),
});
productRouter.post("/", validateRequest(CreateProductRequestSchema), productController.create);

// GET ALL
productRegistry.registerPath({
  method: "get",
  path: "/products",
  tags: ["Product"],
  summary: "Get products",
  description: "Fetch products with filtering, search, sorting and pagination",
  request: { query: ProductQuerySchema },
  responses: createApiResponse(ProductListResponseSchema, "Success"),
});
productRouter.get("/", productController.getAll);

// GET ONE
productRegistry.registerPath({
  method: "get",
  path: "/products/{id}",
  tags: ["Product"],
  request: { params: GetProductSchema.shape.params },
  responses: createApiResponse(ProductSchema, "Success"),
});
productRouter.get("/:id", validateRequest(GetProductSchema), productController.getById);

// UPDATE
productRegistry.registerPath({
  method: "patch",
  path: "/products/{id}",
  tags: ["Product"],
  request: {
    body: { content: { "application/json": { schema: UpdateProductSchema} } },
    params: GetProductSchema.shape.params,
  },
  responses: createApiResponse(ProductSchema, "Success"),
});
productRouter.patch("/:id", validateRequest(UpdateProductRequestSchema), productController.update);

// DELETE
productRegistry.registerPath({
  method: "delete",
  path: "/products/{id}",
  tags: ["Product"],
  request: { params: GetProductSchema.shape.params },
  responses: createApiResponse(z.void(), "Product deleted"),
});
productRouter.delete("/:id", validateRequest(GetProductSchema), productController.delete);