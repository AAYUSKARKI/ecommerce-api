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
import { productController } from "./productController";
import { verifyJWT } from "@/common/middleware/verifyJWT";

export const productRegistry = new OpenAPIRegistry();
export const productRouter: Router = express.Router();

productRegistry.register("Product", ProductSchema);

productRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});
// CREATE
productRegistry.registerPath({
  method: "post",
  path: "/products",
  tags: ["Product"],
  request: { body: { content: { "application/json": { schema: CreateProductSchema} } } },
  responses: createApiResponse(ProductSchema, "Success"),
  security: [{ bearerAuth: [] }],
});
productRouter.post("/",verifyJWT, productController.create);

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
productRouter.get("/:id", productController.getById);

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
  security: [{ bearerAuth: [] }],
});
productRouter.patch("/:id", verifyJWT, productController.update);

// DELETE
productRegistry.registerPath({
  method: "delete",
  path: "/products/{id}",
  tags: ["Product"],
  request: { params: GetProductSchema.shape.params },
  responses: createApiResponse(z.void(), "Product deleted"),
  security: [{ bearerAuth: [] }],
});
productRouter.delete("/:id", verifyJWT, productController.delete);