// src/api/wishlist/wishlistRoutes.ts
import express, { type Router } from "express";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import {
  WishlistItemSchema,
  WishlistResponseSchema,
  AddToWishlistSchema,
  RemoveFromWishlistSchema,
  GetWishlistQuerySchema,
} from "./wishlistModel";
import { wishlistController } from "./wishlistController";
import { verifyJWT } from "@/common/middleware/verifyJWT";

export const wishlistRegistry = new OpenAPIRegistry();
export const wishlistRouter: Router = express.Router();

// Register schemas
wishlistRegistry.register("WishlistItem", WishlistItemSchema);

// Routes
wishlistRouter.post("/", verifyJWT, wishlistController.add);
wishlistRouter.delete("/:productId", verifyJWT, wishlistController.remove);
wishlistRouter.get("/", verifyJWT, wishlistController.getAll);
wishlistRouter.delete("/", verifyJWT, wishlistController.clear); // clear all

// OpenAPI Docs
wishlistRegistry.registerPath({
  method: "post",
  path: "/wishlist",
  tags: ["Wishlist"],
  request: { body: {
    content: { "application/json": { schema: AddToWishlistSchema.shape.body } }
  } },
  responses: createApiResponse(WishlistItemSchema, "Added to wishlist"),
  security: [{ bearerAuth: [] }],
});

wishlistRegistry.registerPath({
  method: "delete",
  path: "/wishlist/{productId}",
  tags: ["Wishlist"],
  request: { params: RemoveFromWishlistSchema.shape.params },
  responses: createApiResponse(z.void(), "Removed from wishlist"),
  security: [{ bearerAuth: [] }],
});

wishlistRegistry.registerPath({
  method: "get",
  path: "/wishlist",
  tags: ["Wishlist"],
  request: { query: GetWishlistQuerySchema },
  responses: createApiResponse(WishlistResponseSchema, "Wishlist retrieved"),
  security: [{ bearerAuth: [] }],
});

wishlistRegistry.registerPath({
  method: "delete",
  path: "/wishlist",
  tags: ["Wishlist"],
  summary: "Clear entire wishlist",
  responses: createApiResponse(z.void(), "Wishlist cleared"),
  security: [{ bearerAuth: [] }],
});