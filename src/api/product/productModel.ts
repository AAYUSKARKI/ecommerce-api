import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

// Base Product Schema (for responses)
export const ProductSchema = z.object({
  id:               z.number(),
  name:             z.string(),
  slug:             z.string(),
  brand:            z.string().nullable().optional(),
  description:      z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(),
  price:            z.number(),                   // Decimal → number in JS
  originalPrice:    z.number().nullable().optional(),
  discount:         z.string().nullable().optional(),
  sku:              z.string().nullable().optional(),
  stock:            z.number(),
  rating:           z.number(),
  reviewsCount:     z.number(),
  isActive:         z.boolean(),
  isFeatured:       z.boolean(),
  categoryId:       z.number(),
  createdAt:        z.date(),
  updatedAt:        z.date(),
});

export const PublicProductSchema = ProductSchema.extend({
  image: z.string().nullable().optional().describe("Primary image URL"),
  category: z
    .object({
      name: z.string(),
      slug: z.string(),
    })
    .nullable()
    .optional(),
})

export const ProductListResponseSchema = z.object({
  data: z.array(PublicProductSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
})
// Schema for creating a product
export const CreateProductSchema = z.object({
  name:             z.string().min(1),
  slug:             z.string().min(1),
  brand:            z.string().optional(),
  description:      z.string().optional(),
  shortDescription: z.string().optional(),
  price:            z.number().positive(),
  originalPrice:    z.number().positive().optional(),
  discount:         z.string().optional(),
  sku:              z.string().optional(),
  stock:            z.number().int().min(0),
  isActive:         z.boolean().optional(),
  isFeatured:       z.boolean().optional(),
  categoryId:       z.number().int(),
});

// Schema for updating a product (all fields optional)
export const UpdateProductSchema = CreateProductSchema.partial();

// Request schemas for validation middleware
export const CreateProductRequestSchema = z.object({
  body: CreateProductSchema,
});
export const UpdateProductRequestSchema = z.object({
  body: UpdateProductSchema,
  params: z.object({ id: commonValidations.id }),
});
export const GetProductSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const ProductQuerySchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  featured: z.enum(["true", "false"]).optional(),
  q: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.enum(["price-asc", "price-desc", "newest", "rating"]).optional(),
});
export interface ProductQuery {
  category?: string;
  brand?: string;
  featured?: string;
  q?: string;
  page?: string;
  limit?: string;
  sort?: string; // "price-asc" | "price-desc" | "newest" | "rating"
}
// Types
export type Product = z.infer<typeof ProductSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type PublicProduct = z.infer<typeof PublicProductSchema>;
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;