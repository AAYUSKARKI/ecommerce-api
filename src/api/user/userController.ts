import type { Request, RequestHandler, Response } from "express";
import { RegisterSchema, LoginSchema } from "./userModel";
import { userService } from "@/api/user/userService";
import { logger } from "@/server";

class UserController {
    public register: RequestHandler = async (req: Request, res: Response) => {
        logger.info("request body",req.body)
        const data = RegisterSchema.parse(req.body);
        const serviceResponse = await userService.register(data);
        res.status(serviceResponse.statusCode).send(serviceResponse);
    }

    public login: RequestHandler = async (req: Request, res: Response) => {
        const data = LoginSchema.parse(req.body);
        const serviceResponse = await userService.login(data);
        res.status(serviceResponse.statusCode).send(serviceResponse);
    }

	public getUsers: RequestHandler = async (_req: Request, res: Response) => {
		const serviceResponse = await userService.findAll();
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getUser: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await userService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const userController = new UserController();