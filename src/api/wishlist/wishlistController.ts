// src/api/wishlist/wishlistController.ts
import type { Request, Response, RequestHandler } from "express";
import { wishlistService } from "./wishlistService";
import type { AddToWishlistInput } from "./wishlistModel";

class WishlistController {
  public add: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data: AddToWishlistInput = req.body;
    const response = await wishlistService.add(userId, data);
    res.status(response.statusCode).json(response);
  };

  public remove: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const productId = Number.parseInt(req.params.productId, 10);
    const response = await wishlistService.remove(userId, productId);
    res.status(response.statusCode).json(response);
  };

  public getAll: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const response = await wishlistService.getAll(userId, req.query);
    res.status(response.statusCode).json(response);
  };

  public clear: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const response = await wishlistService.clear(userId);
    res.status(response.statusCode).json(response);
  };
}

export const wishlistController = new WishlistController();