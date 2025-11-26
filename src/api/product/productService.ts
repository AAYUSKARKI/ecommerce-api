import { StatusCodes } from "http-status-codes";
import type { Product,ProductListResponse, CreateProductInput, UpdateProductInput, ProductQuery } from "./productModel";
import { ProductRepository } from "./productRepository";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { Prisma } from "@/generated/client";

export class ProductService {
  private repository: ProductRepository;

  constructor(repository: ProductRepository = new ProductRepository()) {
    this.repository = repository;
  }

  async create(data: CreateProductInput): Promise<ServiceResponse<Product | null>> {
    try {
      const existing = await this.repository.findBySlugAsync(data.slug);
      if (existing) {
        return ServiceResponse.failure("Product with this slug already exists", null, StatusCodes.CONFLICT);
      }
      const product = await this.repository.createAsync(data);
      return ServiceResponse.success("Product created successfully", product, StatusCodes.CREATED);
    } catch (err) {
      const message = (err as Error).message;
      return ServiceResponse.failure("Error creating product", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getAll(query: ProductQuery): Promise<ServiceResponse<ProductListResponse | null>> {
    try {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || "12", 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = { isActive: true };

    if (query.category) {
      where.category = { slug: query.category.toLowerCase() };
    }
    if (query.brand) {
      where.brand = { contains: query.brand, mode: "insensitive" };
    }
    if (query.featured === "true") {
      where.isFeatured = true;
    }
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: "insensitive" } },
        { brand: { contains: query.q, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    switch (query.sort) {
      case "price-asc":  orderBy = { price: "asc" }; break;
      case "price-desc": orderBy = { price: "desc" }; break;
      case "newest":     orderBy = { createdAt: "desc" }; break;
      case "rating":     orderBy = { rating: "desc" }; break;
    }

    const [products, total] = await Promise.all([
      this.repository.findManyPublic({ where, orderBy, skip, take: limit }),
      this.repository.count(where),
    ]);

    return ServiceResponse.success("Products retrieved", {
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    return ServiceResponse.failure(
      "Error fetching products",
      null,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

  async getById(id: number): Promise<ServiceResponse<Product | null>> {
    try {
      const product = await this.repository.findByIdAsync(id);
      if (!product) {
        return ServiceResponse.failure("Product not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success("Product found", product);
    } catch (err) {
      return ServiceResponse.failure("Error fetching product", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, data: UpdateProductInput): Promise<ServiceResponse<Product | null>> {
    try {
      const product = await this.repository.findByIdAsync(id);
      if (!product) {
        return ServiceResponse.failure("Product not found", null, StatusCodes.NOT_FOUND);
      }
      const updated = await this.repository.updateAsync(id, data);
      return ServiceResponse.success("Product updated", updated);
    } catch (err) {
      return ServiceResponse.failure("Error updating product", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: number): Promise<ServiceResponse<null>> {
    try {
      const product = await this.repository.findByIdAsync(id);
      if (!product) {
        return ServiceResponse.failure("Product not found", null, StatusCodes.NOT_FOUND);
      }
      await this.repository.deleteAsync(id);
      return ServiceResponse.success("Product deleted", null, StatusCodes.NO_CONTENT);
    } catch (err) {
      return ServiceResponse.failure("Error deleting product", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const productService = new ProductService();