import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { GetUserSchema, UserSchema,RegisterSchema,LoginSchema,LoginResponseSchema,RegisterRequestSchema,LoginRequestSchema } from "@/api/user/userModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register("User", UserSchema);

userRegistry.registerPath({
	method: "post",
	path: "/users/register",
	tags: ["User"],
	request: { 
		body:{
			content:{
				"application/json":{schema:RegisterSchema}
			}
		}
	 },
	responses: createApiResponse(UserSchema, "Success"),
});

userRouter.post("/register", validateRequest(RegisterRequestSchema), userController.register);

userRegistry.registerPath({
	method: "post",
	path: "/users/login",
	tags: ["User"],
	request: { 
		body:{
		     content:{
			"application/json":{schema:LoginSchema}
		    }
		}
     },
	responses: createApiResponse(LoginResponseSchema, "Success"),
});

userRouter.post("/login", validateRequest(LoginRequestSchema), userController.login);

userRegistry.registerPath({
	method: "get",
	path: "/users",
	tags: ["User"],
	responses: createApiResponse(z.array(UserSchema), "Success"),
});

userRouter.get("/", userController.getUsers);

userRegistry.registerPath({
	method: "get",
	path: "/users/{id}",
	tags: ["User"],
	request: { params: GetUserSchema.shape.params },
	responses: createApiResponse(UserSchema, "Success"),
});

userRouter.get("/:id", validateRequest(GetUserSchema), userController.getUser);