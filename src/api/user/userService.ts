import { StatusCodes } from "http-status-codes";
import type { User, Login, Register, LoginResponse } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/utils/serviceResponse";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
export class UserService {
	private userRepository: UserRepository;

	constructor(repository: UserRepository = new UserRepository()) {
		this.userRepository = repository;
	}

	async register(data: Register): Promise<ServiceResponse<User | null>> {
		try {
			const userExists = await this.userRepository.findByEmailAsync(data.email);
			if (userExists) {
				return ServiceResponse.failure("User already exists", null, StatusCodes.CONFLICT);
			}
			const hashedPassword = await bcrypt.hash(data.password, 10);
			const userCreated = await this.userRepository.createAsync({ ...data, password: hashedPassword });
			return ServiceResponse.success<User>("User created", userCreated, StatusCodes.CREATED);
		} catch (ex) {
			const errorMessage = `Error creating user: ${(ex as Error).message}`;
			return ServiceResponse.failure("An error occurred while creating user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async login(data: Login): Promise<ServiceResponse<LoginResponse | null>> {
		try {
			const user = await this.userRepository.findByEmailAsync(data.email);
			if (!user) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}
			const isPasswordValid = await bcrypt.compare(data.password, user.password);
			if (!isPasswordValid) {
				return ServiceResponse.failure("Invalid password", null, StatusCodes.UNAUTHORIZED);
			}
			const token = jwt.sign({ id: user.id }, "secret", { expiresIn: "1h" });

			const loginResponse: LoginResponse = {
				id: user.id,
				name: `${user.firstname} ${user.lastname}`.trim(),
				email: user.email,
				token,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			};
			return ServiceResponse.success<LoginResponse>("User logged in", loginResponse);
		} catch (ex) {
			const errorMessage = `Error logging in user: ${(ex as Error).message}`;
			return ServiceResponse.failure("An error occurred while logging in user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Retrieves all users from the database
	async findAll(): Promise<ServiceResponse<User[] | null>> {
		try {
			const users = await this.userRepository.findAllAsync();
			if (!users || users.length === 0) {
				return ServiceResponse.failure("No Users found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User[]>("Users found", users);
		} catch (ex) {
			const errorMessage = `Error finding all users: $${(ex as Error).message}`;
			return ServiceResponse.failure(
				"An error occurred while retrieving users.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Retrieves a single user by their ID
	async findById(id: number): Promise<ServiceResponse<User | null>> {
		try {
			const user = await this.userRepository.findByIdAsync(id);
			if (!user) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User>("User found", user);
		} catch (ex) {
			const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
			return ServiceResponse.failure("An error occurred while finding user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const userService = new UserService();