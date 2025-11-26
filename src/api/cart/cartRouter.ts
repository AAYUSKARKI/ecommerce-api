import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import {
  CartResponseSchema,
  AddToCartRequestSchema,
  UpdateCartItemRequestSchema,
  CartItemParamsSchema,
} from "./cartModel";
import { cartController } from "./cartController";
import { verifyJWT } from "@/common/middleware/verifyJWT";

export const cartRegistry = new OpenAPIRegistry();
export const cartRouter: Router = express.Router();

cartRegistry.register("Cart", CartResponseSchema);

cartRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});
// GET Cart
cartRegistry.registerPath({
  method: "get",
  path: "/cart",
  tags: ["Cart"],
  responses: createApiResponse(CartResponseSchema, "Success"),
  security: [{ bearerAuth: [] }],
});
cartRouter.get("/", verifyJWT, cartController.getCart);

// ADD to Cart
cartRegistry.registerPath({
  method: "post",
  path: "/cart",
  tags: ["Cart"],
  request: { body: { content: { "application/json": { schema: AddToCartRequestSchema.shape.body } } } },
  responses: createApiResponse(CartResponseSchema, "Item added to cart"),
  security: [{ bearerAuth: [] }],
});
cartRouter.post("/", verifyJWT, cartController.addToCart);

// UPDATE Cart Item
cartRegistry.registerPath({
  method: "patch",
  path: "/cart/{productId}",
  tags: ["Cart"],
  request: {
    params: CartItemParamsSchema.shape.params,
    body: { content: { "application/json": { schema: UpdateCartItemRequestSchema.shape.body } } },
  },
  responses: createApiResponse(CartResponseSchema, "Cart updated"),
  security: [{ bearerAuth: [] }],
});
cartRouter.patch("/:productId", verifyJWT, cartController.updateItem);

// REMOVE Item
cartRegistry.registerPath({
  method: "delete",
  path: "/cart/{productId}",
  tags: ["Cart"],
  request: { params: CartItemParamsSchema.shape.params },
  responses: createApiResponse(CartResponseSchema, "Item removed"),
  security: [{ bearerAuth: [] }],
});
cartRouter.delete("/:productId", verifyJWT, cartController.removeItem);

// CLEAR Cart
cartRegistry.registerPath({
  method: "delete",
  path: "/cart",
  tags: ["Cart"],
  responses: createApiResponse(z.void(), "Cart cleared"),
  security: [{ bearerAuth: [] }],
});
cartRouter.delete("/", verifyJWT, cartController.clearCart);