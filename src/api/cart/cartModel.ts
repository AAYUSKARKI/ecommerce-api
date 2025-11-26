import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

// Base Cart Item Schema
export const CartItemSchema = z.object({
  productId: z.number(),
  name: z.string(),
  slug: z.string(),
  price: z.number(),
  image: z.string().nullable().optional(),
  stock: z.number(),
  quantity: z.number().int().min(1),
});

export const CartSchema = z.object({
  id: z.number(),
  userId: z.number(),
  items: z.array(CartItemSchema),
  itemsCount: z.number().int(),
  totalAmount: z.number(),
  updatedAt: z.date(),
});

// Public response schemas
export const CartResponseSchema = CartSchema;

export const AddToCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).default(1),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
});

// Request validation schemas
export const AddToCartRequestSchema = z.object({
  body: AddToCartSchema,
});

export const UpdateCartItemRequestSchema = z.object({
  body: UpdateCartItemSchema,
  params: z.object({
    productId: commonValidations.id,
  }),
});

export const CartItemParamsSchema = z.object({
  params: z.object({
    productId: commonValidations.id,
  }),
});

// Types
export type Cart = z.infer<typeof CartSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;
export type CartResponse = z.infer<typeof CartResponseSchema>;