import { prisma } from "@/common/lib/prisma";
import type { WishlistItem } from "./wishlistModel";

export class WishlistRepository {
  private select = {
    id: true,
    productId: true,
    userId: true,
    createdAt: true,
    product: {
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        discount: true,
        stock: true,
        isActive: true,
        images: {
          where: { isPrimary: true },
          select: { url: true },
          take: 1,
        },
      },
    },
  };

  async addAsync(userId: number, productId: number): Promise<WishlistItem> {
    const result = await prisma.wishlistItem.create({
      data: { userId, productId },
      select: this.select,
    });

    return {
      ...result,
      product: {
        ...result.product,
        price: Number(result.product.price.toString()),
        originalPrice: result.product.originalPrice
          ? Number(result.product.originalPrice.toString())
          : null,
        image: result.product.images[0]?.url || null,
      },
    } as WishlistItem;
  }

  async removeAsync(userId: number, productId: number): Promise<void> {
    await prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId } },
    });
  }

  async findAllByUserIdAsync(userId: number, skip: number, take: number): Promise<WishlistItem[]> {
    const results = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: this.select,
    });

    return results.map((item) => ({
      ...item,
      product: {
        ...item.product,
        price: Number(item.product.price.toString()),
        originalPrice: item.product.originalPrice
          ? Number(item.product.originalPrice.toString())
          : null,
        image: item.product.images[0]?.url || null,
      },
    }));
  }

  async countByUserIdAsync(userId: number): Promise<number> {
    return prisma.wishlistItem.count({ where: { userId } });
  }

  async existsAsync(userId: number, productId: number): Promise<boolean> {
    const item = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return !!item;
  }

  async clearAsync(userId: number): Promise<void> {
    await prisma.wishlistItem.deleteMany({ where: { userId } });
  }
}

export const wishlistRepository = new WishlistRepository();