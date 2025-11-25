import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { ZodError, ZodSchema } from "zod";
import { ServiceResponse } from "./serviceResponse";

export const validateRequest = (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.body);
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
       const errorMessage = `Invalid Input: ${(error as ZodError).errors.map((err) => err.message).join(', ')}`;
       const statusCode = StatusCodes.BAD_REQUEST;
       const serviceResponse = ServiceResponse.failure(errorMessage,null, statusCode);
       res.status(serviceResponse.statusCode).send(serviceResponse);
    }
};