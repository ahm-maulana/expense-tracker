import type {
	UpdatePasswordInput,
	UpdateUserInput,
	UserProfileDto,
} from "@repo/api-contracts";
import bcrypt from "bcrypt";
import {
	BadRequestError,
	NotFoundError,
	UnauthorizedError,
} from "../../common/errors/app-error.js";
import type UserRepository from "./user.repository.js";

class UserService {
	constructor(private userRepository: UserRepository) {}

	async getMe(id: string): Promise<UserProfileDto> {
		const existingUser = await this.userRepository.findById(id);

		if (!existingUser) {
			throw new NotFoundError("User not found.");
		}

		return {
			id: existingUser.id,
			email: existingUser.email,
			name: existingUser.name,
			createdAt: existingUser.createdAt,
			updatedAt: existingUser.updatedAt,
		};
	}

	async updateProfile(
		id: string,
		data: UpdateUserInput,
	): Promise<UserProfileDto> {
		const existingUser = await this.userRepository.findById(id);

		if (!existingUser) {
			throw new NotFoundError("User not found.");
		}

		const updatedUser = await this.userRepository.update(id, data);

		return {
			id: updatedUser.id,
			email: updatedUser.email,
			name: updatedUser.name,
			createdAt: updatedUser.createdAt,
			updatedAt: updatedUser.updatedAt,
		};
	}

	async updatePassword(id: string, data: UpdatePasswordInput) {
		const existingUser = await this.userRepository.findById(id);

		if (!existingUser) {
			throw new NotFoundError("User not found.");
		}

		const isCurrentPasswordMatch = await bcrypt.compare(
			data.currentPassword,
			existingUser.passwordHash,
		);

		if (!isCurrentPasswordMatch) {
			throw new UnauthorizedError("Current password is incorrect.");
		}

		const isSamePassword = await bcrypt.compare(
			data.newPassword,
			existingUser.passwordHash,
		);

		if (isSamePassword) {
			throw new BadRequestError(
				"New password must be different from the current password.",
			);
		}

		const hashedNewPassword = await bcrypt.hash(data.newPassword, 10);

		await this.userRepository.updatePassword(id, {
			passwordHash: hashedNewPassword,
		});
	}
}

export default UserService;
