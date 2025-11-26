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

// Types
export type Product = z.infer<typeof ProductSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;