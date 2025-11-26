import type { Request, Response, RequestHandler } from "express";
import { productService } from "@/api/product/productService";
import type { CreateProductInput, UpdateProductInput } from "./productModel";

class ProductController {
  public create: RequestHandler = async (req: Request, res: Response) => {
    const data: CreateProductInput = req.body;
    const response = await productService.create(data);
    res.status(response.statusCode).json(response);
  };

  public getAll: RequestHandler = async (req: Request, res: Response) => {
    const response = await productService.getAll(req.query);
    res.status(response.statusCode).json(response);
  };

  public getById: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    const response = await productService.getById(id);
    res.status(response.statusCode).json(response);
  };

  public update: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    const data: UpdateProductInput = req.body;
    const response = await productService.update(id, data);
    res.status(response.statusCode).json(response);
  };

  public delete: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id, 10);
    const response = await productService.delete(id);
    res.status(response.statusCode).json(response);
  };
}

export const productController = new ProductController();