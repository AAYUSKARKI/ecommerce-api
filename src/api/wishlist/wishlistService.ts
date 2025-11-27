import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import type { WishlistItem, WishlistResponse, AddToWishlistInput } from "./wishlistModel";
import { WishlistRepository } from "./wishlistRepository";
import { prisma } from "@/common/lib/prisma";

export class WishlistService {
  private repository: WishlistRepository;

  constructor(repository = new WishlistRepository()) {
    this.repository = repository;
  }

  async add(userId: number, data: AddToWishlistInput): Promise<ServiceResponse<WishlistItem | null>> {
    try {
      // Check if product exists and is active
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
        select: { id: true, isActive: true },
      });

      if (!product) {
        return ServiceResponse.failure("Product not found", null, StatusCodes.NOT_FOUND);
      }

      if (!product.isActive) {
        return ServiceResponse.failure("Product is no longer available", null, StatusCodes.GONE);
      }

      const exists = await this.repository.existsAsync(userId, data.productId);
      if (exists) {
        return ServiceResponse.failure("Product already in wishlist", null, StatusCodes.CONFLICT);
      }

      const item = await this.repository.addAsync(userId, data.productId);
      return ServiceResponse.success("Added to wishlist", item, StatusCodes.CREATED);
    } catch (err) {
      return ServiceResponse.failure(
        "Error adding to wishlist",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async remove(userId: number, productId: number): Promise<ServiceResponse<null>> {
    try {
      const exists = await this.repository.existsAsync(userId, productId);
      if (!exists) {
        return ServiceResponse.failure("Item not in wishlist", null, StatusCodes.NOT_FOUND);
      }

      await this.repository.removeAsync(userId, productId);
      return ServiceResponse.success("Removed from wishlist", null);
    } catch (err) {
      return ServiceResponse.failure(
        "Error removing from wishlist",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAll(userId: number, query: { page?: string; limit?: string }): Promise<ServiceResponse<WishlistResponse | null>> {
    try {
      const page = Math.max(1, parseInt(query.page || "1", 10));
      const limit = Math.min(50, Math.max(1, parseInt(query.limit || "12", 10)));
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        this.repository.findAllByUserIdAsync(userId, skip, limit),
        this.repository.countByUserIdAsync(userId),
      ]);

      return ServiceResponse.success("Wishlist retrieved", {
        data: items,
        total,
      });
    } catch (err) {
      return ServiceResponse.failure(
        "Error fetching wishlist",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async clear(userId: number): Promise<ServiceResponse<null>> {
    try {
      await this.repository.clearAsync(userId);
      return ServiceResponse.success("Wishlist cleared", null);
    } catch (err) {
      return ServiceResponse.failure(
        "Error clearing wishlist",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const wishlistService = new WishlistService();