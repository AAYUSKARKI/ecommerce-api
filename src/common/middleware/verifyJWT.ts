import { ServiceResponse } from "../utils/serviceResponse";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import cache from "memory-cache";
import { handleServiceResponse } from "../utils/httpHandlers";
import { prisma } from "../lib/prisma";

export const verifyJWT: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.replace("Bearer", "").trim();
    console.log(req.headers.authorization, 'Authorization header');
    // console.log(token, 'Extracted token');
    if (!token) {
      const response = ServiceResponse.failure("Token not found", null, StatusCodes.UNAUTHORIZED);
      handleServiceResponse(response, res);
      return;
    }
    // Check if the token is blacklisted
    const isBlacklisted = cache.get(token);
    // console.log(isBlacklisted, 'is the black list token')
    if (isBlacklisted) {
      const response = ServiceResponse.failure("Token is blacklisted", null, StatusCodes.UNAUTHORIZED);
      handleServiceResponse(response, res);
      return;
    }

    // Verify token
    const decodedToken = jwt.verify(token, "secret");

    if (!decodedToken) {
      const response = ServiceResponse.failure("Token not verified", null, StatusCodes.UNAUTHORIZED);
      handleServiceResponse(response, res);
      return;
    }

    // Find the user by the decoded token's ID
    const user = await prisma.user.findUnique({ where: { id: (decodedToken as any).id }});

    if (!user) {
      const response = ServiceResponse.failure("User not found", null, StatusCodes.UNAUTHORIZED);
      handleServiceResponse(response, res);
      return;
    }

    // Attach the user to the request object
    req.user = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      mobilenumber: user.mobilenumber
    };

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error in verifyJWT middleware:', error);
    let message = "Internal server error";
    if (error instanceof jwt.TokenExpiredError) {
      message = "Token has expired";
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = "Invalid token";
    }

    const response = ServiceResponse.failure(message, null, StatusCodes.UNAUTHORIZED);
    handleServiceResponse(response, res);
    return;
  }
};
