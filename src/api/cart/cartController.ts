import type { Request, Response, RequestHandler } from "express";
import { cartService } from "./cartService";
import type { AddToCartInput, UpdateCartItemInput } from "./cartModel";

class CartController {
  public getCart: RequestHandler = async (req: Request, res: Response) => {
    const userId = (req as any).user.id; // assuming auth middleware sets req.user
    const response = await cartService.getCart(userId);
    res.status(response.statusCode).json(response);
  };

  public addToCart: RequestHandler = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const data: AddToCartInput = req.body;
    const response = await cartService.addToCart(userId, data);
    res.status(response.statusCode).json(response);
  };

  public updateItem: RequestHandler = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const productId = Number.parseInt(req.params.productId, 10);
    const data: UpdateCartItemInput = req.body;
    const response = await cartService.updateItem(userId, productId, data);
    res.status(response.statusCode).json(response);
  };

  public removeItem: RequestHandler = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const productId = Number.parseInt(req.params.productId, 10);
    const response = await cartService.removeItem(userId, productId);
    res.status(response.statusCode).json(response);
  };

  public clearCart: RequestHandler = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const response = await cartService.clearCart(userId);
    res.status(response.statusCode).json(response);
  };
}

export const cartController = new CartController();