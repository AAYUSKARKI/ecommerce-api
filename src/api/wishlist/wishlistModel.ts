import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

// Public Wishlist Item (what client sees)
export const WishlistItemSchema = z.object({
  id: z.number(),
  productId: z.number(),
  userId: z.number(),
  createdAt: z.date(),
  product: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    price: z.number(),
    originalPrice: z.number().nullable().optional(),
    discount: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    isActive: z.boolean(),
    stock: z.number(),
  }),
});

export const WishlistResponseSchema = z.object({
  data: z.array(WishlistItemSchema),
  total: z.number(),
});

// Request schemas
export const AddToWishlistSchema = z.object({
  body: z.object({
    productId: z.number().int().positive(),
  }),
});

export const RemoveFromWishlistSchema = z.object({
  params: z.object({
    productId: commonValidations.id,
  }),
});

export const GetWishlistQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Types
export type WishlistItem = z.infer<typeof WishlistItemSchema>;
export type WishlistResponse = z.infer<typeof WishlistResponseSchema>;
export type AddToWishlistInput = z.infer<typeof AddToWishlistSchema.shape.body>;