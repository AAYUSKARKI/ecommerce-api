// src/api/order/orderService.ts
import { StatusCodes } from "http-status-codes";
import type {
  Order,
  CreateOrderInput,
  UpdateOrderStatusInput,
  OrderListResponse,
  OrderQuery,
} from "./orderModel";
import { OrderRepository, mapDecimalToNumber } from "./orderRepository";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import { prisma } from "@/common/lib/prisma";

export class OrderService {
  private repo: OrderRepository;

  constructor(repo = new OrderRepository()) {
    this.repo = repo;
  }

  async create(data: CreateOrderInput, userId: number): Promise<ServiceResponse<Order | null>> {
    return prisma.$transaction(async (tx) => {
      // 1. Validate address
      const address = await tx.address.findFirst({
        where: { id: data.shippingAddressId, userId },
      });
      if (!address) {
        return ServiceResponse.failure("Invalid shipping address", null, StatusCodes.BAD_REQUEST);
      }

      // 2. Validate products + calculate total + prepare items
      let totalAmount = 0;
      const orderItems: Array<{
        productId: number;
        quantity: number;
        price: any;
        name: string;
        image: string | null;
      }> = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            images: { where: { isPrimary: true }, take: 1, select: { url: true } },
          },
        });

        if (!product) {
          return ServiceResponse.failure(`Product not found: ${item.productId}`, null, StatusCodes.BAD_REQUEST);
        }
        if (product.stock < item.quantity) {
          return ServiceResponse.failure(`Insufficient stock for ${product.name}`, null, StatusCodes.BAD_REQUEST);
        }

        totalAmount += Number(product.price) * item.quantity;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          name: product.name,
          image: product.images[0]?.url || null,
        });

        // Reduce stock
        await this.repo.decrementProductStock(product.id, item.quantity);
      }

      // 3. Create order via repository
      const order = await this.repo.createAsync({
        ...data,
        userId,
        totalAmount,
        items: orderItems,
      });

      return ServiceResponse.success("Order created successfully", order, StatusCodes.CREATED);
    });
  }

  async getAll(query: OrderQuery, userId: number, isAdmin: boolean): Promise<ServiceResponse<OrderListResponse | null>> {
    try {
      const page = Math.max(1, parseInt(query.page || "1", 10));
      const limit = Math.min(50, Math.max(1, parseInt(query.limit || "10", 10)));
      const skip = (page - 1) * limit;

      const where = isAdmin ? (query.status ? { status: query.status } : {}) : { userId, ...(query.status && { status: query.status }) };

      const [orders, total] = await Promise.all([
        this.repo.findManySummary({ where, skip, take: limit }),
        this.repo.count(where),
      ]);

      const data = orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        userId: o.userId,
        status: o.status,
        totalAmount: Number(o.totalAmount.toString()),
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        itemsCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
        shippingCity: o.shippingAddress.city,
      }));

      return ServiceResponse.success("Orders retrieved", {
        data,
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
      return ServiceResponse.failure("Error fetching orders", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getById(id: number, userId: number, isAdmin: boolean): Promise<ServiceResponse<Order | null>> {
    try {
      const order = await this.repo.findByIdAsync(id);
      if (!order) return ServiceResponse.failure("Order not found", null, StatusCodes.NOT_FOUND);
      if (!isAdmin && order.userId !== userId) return ServiceResponse.failure("Forbidden", null, StatusCodes.FORBIDDEN);

      return ServiceResponse.success("Order found", order);
    } catch (err) {
      return ServiceResponse.failure("Error fetching order", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async updateStatus(id: number, data: UpdateOrderStatusInput, isAdmin: boolean): Promise<ServiceResponse<Order | null>> {
    if (!isAdmin) return ServiceResponse.failure("Unauthorized", null, StatusCodes.FORBIDDEN);

    try {
      const order = await this.repo.updateStatusAsync(id, data.status);
      return ServiceResponse.success("Order status updated", order);
    } catch (err: any) {
      return err.code === "P2025"
        ? ServiceResponse.failure("Order not found", null, StatusCodes.NOT_FOUND)
        : ServiceResponse.failure("Error updating order", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const orderService = new OrderService();