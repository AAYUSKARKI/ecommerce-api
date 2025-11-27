import type { Request, Response, RequestHandler } from "express";
import { orderService } from "./orderService";
import type { CreateOrderInput, UpdateOrderStatusInput } from "./orderModel";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string };
    }
  }
}

class OrderController {
  public create: RequestHandler = async (req: Request, res: Response) => {
    const data: CreateOrderInput = req.body;
    const userId = req.user!.id;
    const response = await orderService.create(data, userId);
    res.status(response.statusCode!).json(response);
  };

  public getAll: RequestHandler = async (req: Request, res: Response) => {
    const isAdmin = req.user?.role === "ADMIN";
    const response = await orderService.getAll(req.query as any, req.user!.id, isAdmin);
    res.status(response.statusCode!).json(response);
  };

  public getById: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    const isAdmin = req.user?.role === "ADMIN";
    const response = await orderService.getById(id, req.user!.id, isAdmin);
    res.status(response.statusCode!).json(response);
  };

  public updateStatus: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    const data: UpdateOrderStatusInput = req.body;
    const isAdmin = req.user?.role === "ADMIN";
    const response = await orderService.updateStatus(id, data, isAdmin);
    res.status(response.statusCode!).json(response);
  };
}

export const orderController = new OrderController();