import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const OrderStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

export const OrderSchema = z.object({
  id: z.number(),
  orderNumber: z.string(),
  userId: z.number(),
  status: OrderStatusEnum,
  totalAmount: z.number(),
  paymentMethod: z.string().nullable().optional(),
  paymentStatus: z.string(),
  notes: z.string().nullable().optional(),
  shippingAddress: z.object({
    firstname: z.string(),
    lastname: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipcode: z.string(),
    country: z.string(),
    phone: z.string(),
  }),
  items: z.array(
    z.object({
      productId: z.number(),
      name: z.string(),
      image: z.string().nullable().optional(),
      price: z.number(),
      quantity: z.number(),
    })
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const OrderListResponseSchema = z.object({
  data: z.array(
    OrderSchema.omit({ shippingAddress: true, items: true }).extend({
      itemsCount: z.number(),
      shippingCity: z.string(),
    })
  ),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

export const CreateOrderItemSchema = z.object({
  productId: z.number().int(),
  quantity: z.number().int().min(1),
});

export const CreateOrderSchema = z.object({
  shippingAddressId: z.number().int(),
  paymentMethod: z.string().min(1),
  notes: z.string().optional(),
  items: z.array(CreateOrderItemSchema).min(1),
});

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusEnum,
});

// Request schemas
export const CreateOrderRequestSchema = z.object({
  body: CreateOrderSchema,
});

export const UpdateOrderStatusRequestSchema = z.object({
  body: UpdateOrderStatusSchema,
  params: z.object({ id: commonValidations.id }),
});

export const GetOrderParamsSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const OrderQuerySchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Types
export type Order = z.infer<typeof OrderSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type OrderListResponse = z.infer<typeof OrderListResponseSchema>;
export type OrderQuery = z.infer<typeof OrderQuerySchema>;