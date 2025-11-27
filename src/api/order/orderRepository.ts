// src/api/order/orderRepository.ts
import { prisma } from "@/common/lib/prisma";
import type { Order, CreateOrderInput } from "./orderModel";
import { Prisma, OrderStatus } from "@/generated/client";

export function mapDecimalToNumber(order: any): Order {
  return {
    ...order,
    totalAmount: Number(order.totalAmount.toString()),
    items: order.items.map((i: any) => ({
      ...i,
      price: Number(i.price.toString()),
    })),
  };
}

export class OrderRepository {
  // Full select for detail views
  private detailSelect = {
    id: true,
    orderNumber: true,
    userId: true,
    status: true,
    totalAmount: true,
    paymentMethod: true,
    paymentStatus: true,
    notes: true,
    createdAt: true,
    updatedAt: true,
    shippingAddress: {
      select: {
        firstname: true,
        lastname: true,
        street: true,
        city: true,
        state: true,
        zipcode: true,
        country: true,
        phone: true,
      },
    },
    items: {
      select: {
        productId: true,
        name: true,
        image: true,
        price: true,
        quantity: true,
      },
    },
  } satisfies Prisma.OrderSelect;

  // Summary select for list
  private listSelect = {
    id: true,
    orderNumber: true,
    userId: true,
    status: true,
    totalAmount: true,
    paymentStatus: true,
    createdAt: true,
    updatedAt: true,
    items: { select: { quantity: true } },
    shippingAddress: { select: { city: true } },
  } satisfies Prisma.OrderSelect;

  async createAsync(
    data: CreateOrderInput & { userId: number; totalAmount: number; items: Array<{ productId: number; quantity: number; price: any; name: string; image: string | null }> }
  ): Promise<Order> {
    const result = await prisma.order.create({
      data: {
        userId: data.userId,
        shippingAddressId: data.shippingAddressId,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        totalAmount: data.totalAmount,
        items: { create: data.items },
      },
      select: this.detailSelect,
    });

    return mapDecimalToNumber(result);
  }

  async findByIdAsync(id: number): Promise<Order | null> {
    const result = await prisma.order.findUnique({
      where: { id },
      select: this.detailSelect,
    });
    return result ? mapDecimalToNumber(result) : null;
  }

  async findManySummary(params: {
    where: Prisma.OrderWhereInput;
    skip: number;
    take: number;
  }) {
    return prisma.order.findMany({
      ...params,
      orderBy: { createdAt: "desc" },
      select: this.listSelect,
    });
  }

  async count(where: Prisma.OrderWhereInput) {
    return prisma.order.count({ where });
  }

  async updateStatusAsync(id: number, status: OrderStatus): Promise<Order> {
    const result = await prisma.order.update({
      where: { id },
      data: { status },
      select: this.detailSelect,
    });
    return mapDecimalToNumber(result);
  }

  async decrementProductStock(productId: number, quantity: number) {
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });
  }
}