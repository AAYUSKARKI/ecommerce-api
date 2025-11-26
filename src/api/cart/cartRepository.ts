import { prisma } from "@/common/lib/prisma";
import type { Cart, CartItem } from "./cartModel";

function mapDecimalToNumber(value: any): number {
  return value ? Number(value.toString()) : 0;
}

export class CartRepository {
  async findByUserId(userId: number) {
    return await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                stock: true,
                images: {
                  where: { isPrimary: true },
                  select: { url: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });
  }

 async upsertCart(
  userId: number,
  items: { productId: number; quantity: number }[]
) {
  return await prisma.cart.upsert({
    where: { userId },
    update: {
      items: {
        deleteMany: {},
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
    create: {
      userId,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              stock: true,
              images: { where: { isPrimary: true }, take: 1, select: { url: true } },
            },
          },
        },
      },
    },
  });
}

  async clearCart(userId: number) {
    await prisma.cartItem.deleteMany({
      where: { cart: { userId } },
    });
  }
}