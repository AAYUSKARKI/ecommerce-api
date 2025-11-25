import { prisma } from "@/common/lib/prisma";
import type { Register } from "./userModel";
import type { User } from "@/generated/client";
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
				password: true,
                mobilenumber: true,
				avatar: true,
				role: true,
                createdAt: true,
                updatedAt: true
			},
		});
	}
}
