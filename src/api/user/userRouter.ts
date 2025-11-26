import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { GetUserSchema, UserSchema,RegisterSchema,LoginSchema,LoginResponseSchema,RegisterRequestSchema,LoginRequestSchema } from "@/api/user/userModel";
import { userController } from "./userController";
import { verifyJWT } from "@/common/middleware/verifyJWT";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register("User", UserSchema);

userRegistry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

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

userRouter.post("/register", userController.register);

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

userRouter.post("/login", userController.login);

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

userRouter.get("/:id", verifyJWT, userController.getUser);

userRegistry.registerPath({
  method: "post",
  path: "/users/logout",
  tags: ["User"],
  responses: createApiResponse(z.null(), "Success"),
  security: [{ bearerAuth: [] }],
});

userRouter.post("/logout", verifyJWT, userController.logout);