// src/api/order/orderRoutes.ts
import express, { type Router } from "express";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import {
  OrderSchema,
  OrderListResponseSchema,
  CreateOrderRequestSchema,
  UpdateOrderStatusRequestSchema,
  GetOrderParamsSchema,
  OrderQuerySchema,
} from "./orderModel";
import { orderController } from "./orderController";
import { verifyJWT } from "@/common/middleware/verifyJWT";

export const orderRegistry = new OpenAPIRegistry();
export const orderRouter: Router = express.Router();

orderRegistry.register("Order", OrderSchema);

orderRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// CREATE ORDER
orderRegistry.registerPath({
  method: "post",
  path: "/orders",
  tags: ["Order"],
  request: { body: { content: { "application/json": { schema: CreateOrderRequestSchema.shape.body } } } },
  responses: createApiResponse(OrderSchema, "Order created"),
  security: [{ bearerAuth: [] }],
});
orderRouter.post("/", verifyJWT, orderController.create);

// GET MY ORDERS or ALL (admin)
orderRegistry.registerPath({
  method: "get",
  path: "/orders",
  tags: ["Order"],
  request: { query: OrderQuerySchema },
  responses: createApiResponse(OrderListResponseSchema, "Success"),
  security: [{ bearerAuth: [] }],
});
orderRouter.get("/", verifyJWT, orderController.getAll);

// GET ONE
orderRegistry.registerPath({
  method: "get",
  path: "/orders/{id}",
  tags: ["Order"],
  request: { params: GetOrderParamsSchema.shape.params },
  responses: createApiResponse(OrderSchema, "Success"),
  security: [{ bearerAuth: [] }],
});
orderRouter.get("/:id", verifyJWT, orderController.getById);

// UPDATE STATUS (Admin only)
orderRegistry.registerPath({
  method: "patch",
  path: "/orders/{id}/status",
  tags: ["Order"],
  request: {
    body: { content: { "application/json": { schema: UpdateOrderStatusRequestSchema.shape.body } } },
    params: GetOrderParamsSchema.shape.params,
  },
  responses: createApiResponse(OrderSchema, "Status updated"),
  security: [{ bearerAuth: [] }],
});
orderRouter.patch("/:id/status", verifyJWT, orderController.updateStatus);