import { StatusCodes } from "http-status-codes";
import type { Product, CreateProductInput, UpdateProductInput } from "./productModel";
import { ProductRepository } from "./productRepository";
import { ServiceResponse } from "@/common/utils/serviceResponse";

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

  async getAll(): Promise<ServiceResponse<Product[] | null>> {
    try {
      const products = await this.repository.findAllAsync();
      return ServiceResponse.success("Products retrieved", products);
    } catch (err) {
      return ServiceResponse.failure("Error fetching products", null, StatusCodes.INTERNAL_SERVER_ERROR);
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