import { prisma } from "@/common/lib/prisma";
import type { Register } from "./userModel";
import type { User } from "@/generated/client";
import jwt from "jsonwebtoken";
import cache from "memory-cache";
export class UserRepository {
	// Create a user
	async createAsync(user: Register): Promise<User> {
		return prisma.user.create({
			data: user,
		});
	}

	// Update a user
	async updateAsync(user: User): Promise<User> {
		return prisma.user.update({
			where: { id: user.id },
			data: {
				firstname: user.firstname,
				lastname: user.lastname,
				email: user.email,
				password: user.password,
			},
		});
	}

	// Delete a user
	async deleteAsync(user: User): Promise<User> {
		return prisma.user.delete({
			where: { id: user.id },
		});
	}

	// Find by email
	async findByEmailAsync(email: string): Promise<User| null> {
		return prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				firstname: true,
				lastname: true,
				mobilenumber: true,
				avatar: true,
				role: true,
				refresh_token: true,
				email: true,
                password: true,
                createdAt: true,
                updatedAt: true
			},
		});
	}

	// Find all users
	async findAllAsync(): Promise<User[]> {
		return prisma.user.findMany({
			select: {
				id: true,
				firstname: true,
				lastname: true,
				email: true,
				refresh_token: true,
				mobilenumber: true,
				avatar: true,
				role: true,
				password: true,
                createdAt: true,
                updatedAt: true
			},
		});
	}

	// Find by ID
	async findByIdAsync(id: number): Promise<User| null> {
		return prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				firstname: true,
				lastname: true,
				email: true,
				refresh_token: true,
				password: true,
                mobilenumber: true,
				avatar: true,
				role: true,
                createdAt: true,
                updatedAt: true
			},
		});
	}

	async logoutAsync(userId: number, access_token: string): Promise<null> {
    await prisma.user.update({ where: { id: userId }, data: { refresh_token: null } });

    const decodedToken = jwt.decode(access_token) as { exp?: number };

    if (decodedToken?.exp) {
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const timeToLive = decodedToken.exp - currentTimeInSeconds; // Remaining time before token expires

      // Blacklist the access token in node-cache with TTL

      cache.put(access_token, true, timeToLive * 1000);
      // console.log(`Blacklisted token: ${access_token} for ${timeToLive} seconds`);
    }
    return null;
  }
}
