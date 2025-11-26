// src/api/product/productRepository.ts

import { prisma } from "@/common/lib/prisma";
import { Prisma } from "@prisma/client"; // ← keep this import
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from "@/api/product/productModel";

/**
 * Converts Prisma's Decimal → number so your Zod schema stays happy
 */
function mapDecimalToNumber(product: any): Product {
  return {
    ...product,
    price: Number(product.price.toString()),
    originalPrice: product.originalPrice
      ? Number(product.originalPrice.toString())
      : null,
    rating: Number(product.rating.toString()),
  };
}

export class ProductRepository {
  // This is the correct way to type the select object
  private select = {
    id: true,
    name: true,
    slug: true,
    brand: true,
    description: true,
    shortDescription: true,
    price: true,
    originalPrice: true,
    discount: true,
    sku: true,
    stock: true,
    rating: true,
    reviewsCount: true,
    isActive: true,
    isFeatured: true,
    categoryId: true,
    createdAt: true,
    updatedAt: true,
  } 

  async createAsync(data: CreateProductInput): Promise<Product> {
    const result = await prisma.product.create({
      data,
      select: this.select,
    });
    return mapDecimalToNumber(result);
  }

  async findByIdAsync(id: number): Promise<Product | null> {
    const result = await prisma.product.findUnique({
      where: { id },
      select: this.select,
    });
    return result ? mapDecimalToNumber(result) : null;
  }

  async findBySlugAsync(slug: string): Promise<Product | null> {
    const result = await prisma.product.findUnique({
      where: { slug },
      select: this.select,
    });
    return result ? mapDecimalToNumber(result) : null;
  }

  async findAllAsync(): Promise<Product[]> {
    const results = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: this.select,
    });
    return results.map(mapDecimalToNumber);
  }

  async updateAsync(id: number, data: UpdateProductInput): Promise<Product> {
    const result = await prisma.product.update({
      where: { id },
      data,
      select: this.select,
    });
    return mapDecimalToNumber(result);
  }

  async deleteAsync(id: number): Promise<Product> {
    // delete() doesn't support select → fetch first
    const product = await prisma.product.findUnique({
      where: { id },
      select: this.select,
    });

    if (!product) {
      throw new Error("Product not found");
    }

    await prisma.product.delete({ where: { id } });
    return mapDecimalToNumber(product);
  }
}