// src/api/cart/cartService.ts
import { StatusCodes } from "http-status-codes";
import { CartRepository } from "./cartRepository";
import type { AddToCartInput, UpdateCartItemInput, Cart } from "./cartModel";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { prisma } from "@/common/lib/prisma";

export class CartService {
  private repository: CartRepository;

  constructor(repository = new CartRepository()) {
    this.repository = repository;
  }

  async getCart(userId: number): Promise<ServiceResponse<Cart | null>> {
    try {
      const cart = await this.repository.findByUserId(userId);

      // Return empty cart structure if none exists
      if (!cart || cart.items.length === 0) {
        return ServiceResponse.success("Cart is empty", {
          id: 0,
          userId,
          items: [],
          itemsCount: 0,
          totalAmount: 0,
          updatedAt: new Date(),
        });
      }

      const formattedItems = cart.items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: Number(item.product.price.toString()),
        image: item.product.images[0]?.url || null,
        stock: item.product.stock,
        quantity: item.quantity,
      }));

      const totalAmount = formattedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return ServiceResponse.success("Cart retrieved", {
        id: cart.id,
        userId: cart.userId,
        items: formattedItems,
        itemsCount: formattedItems.length,
        totalAmount,
        updatedAt: cart.updatedAt,
      });
    } catch (err) {
      return ServiceResponse.failure(
        "Error fetching cart",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async addToCart(
    userId: number,
    input: AddToCartInput
  ): Promise<ServiceResponse<Cart | null>> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: input.productId },
        select: { id: true, stock: true, isActive: true },
      });

      if (!product || !product.isActive) {
        return ServiceResponse.failure("Product not found or unavailable", null, StatusCodes.NOT_FOUND);
      }

      const currentStock = product.stock;
      const requestedQty = input.quantity;

      if (currentStock < requestedQty) {
        return ServiceResponse.failure("Insufficient stock", null, StatusCodes.BAD_REQUEST);
      }

      const cart = await this.repository.findByUserId(userId);

      // Build new items list with only { productId, quantity }
      const itemsToSave = cart?.items || [];

      const existingItemIndex = itemsToSave.findIndex(
        (i) => i.productId === input.productId
      );

      let newItemsForSave: { productId: number; quantity: number }[] = [];

      if (existingItemIndex !== -1) {
        const existing = itemsToSave[existingItemIndex];
        const newQty = existing.quantity + requestedQty;
        if (newQty > currentStock) {
          return ServiceResponse.failure("Not enough stock after adding", null, StatusCodes.BAD_REQUEST);
        }
        newItemsForSave = itemsToSave.map((item, idx) =>
          idx === existingItemIndex ? { ...item, quantity: newQty } : item
        );
      } else {
        newItemsForSave = [...itemsToSave, { productId: input.productId, quantity: requestedQty }];
      }

      // Save only minimal data
      await this.repository.upsertCart(
        userId,
        newItemsForSave.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      );

      return this.getCart(userId);
    } catch (err) {
      return ServiceResponse.failure(
        "Error adding to cart",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateItem(
    userId: number,
    productId: number,
    input: UpdateCartItemInput
  ): Promise<ServiceResponse<Cart | null>> {
    try {
      const cart = await this.repository.findByUserId(userId);
      if (!cart) {
        return ServiceResponse.failure("Cart not found", null, StatusCodes.NOT_FOUND);
      }

      const item = cart.items.find((i) => i.productId === productId);
      if (!item) {
        return ServiceResponse.failure("Item not in cart", null, StatusCodes.NOT_FOUND);
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { stock: true },
      });

      if (!product || input.quantity > product.stock) {
        return ServiceResponse.failure("Not enough stock", null, StatusCodes.BAD_REQUEST);
      }

      const updatedItemsToSave = cart.items
        .map((i) => 
          i.productId === productId 
            ? { productId: i.productId, quantity: input.quantity }
            : { productId: i.productId, quantity: i.quantity }
        );

      await this.repository.upsertCart(userId, updatedItemsToSave);
      return this.getCart(userId);
    } catch (err) {
      return ServiceResponse.failure(
        "Error updating cart item",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async removeItem(userId: number, productId: number): Promise<ServiceResponse<Cart | null>> {
    try {
      const cart = await this.repository.findByUserId(userId);
      if (!cart) {
        return ServiceResponse.failure("Cart not found", null, StatusCodes.NOT_FOUND);
      }

      const filteredItems = cart.items
        .filter((i) => i.productId !== productId)
        .map((i) => ({ productId: i.productId, quantity: i.quantity }));

      if (filteredItems.length === 0) {
        await this.repository.clearCart(userId);
      } else {
        await this.repository.upsertCart(userId, filteredItems);
      }

      return this.getCart(userId);
    } catch (err) {
      return ServiceResponse.failure(
        "Error removing item from cart",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async clearCart(userId: number): Promise<ServiceResponse<null>> {
    try {
      await this.repository.clearCart(userId);
      return ServiceResponse.success("Cart cleared successfully", null);
    } catch (err) {
      return ServiceResponse.failure(
        "Error clearing cart",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const cartService = new CartService();