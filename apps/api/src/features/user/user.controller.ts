import type {
	ApiResponse,
	UpdatePasswordInput,
	UpdateUserInput,
	UserProfileDto,
} from "@repo/api-contracts";
import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { getAuthenticatedUser } from "../auth/auth.utils.js";
import type UserService from "./user.service.js";

class UserController {
	constructor(private service: UserService) {}

	getMe = async (req: Request, res: Response<ApiResponse<UserProfileDto>>) => {
		const authUser = getAuthenticatedUser(req);

		const userProfile = await this.service.getMe(authUser.id);

		res.status(200).json({
			data: userProfile,
		});
	};

	updateProfile = async (
		req: Request<ParamsDictionary, unknown, UpdateUserInput>,
		res: Response<ApiResponse<UserProfileDto>>,
	) => {
		const authUser = getAuthenticatedUser(req);

		const userProfile = await this.service.updateProfile(authUser.id, req.body);

		res.status(200).json({
			data: userProfile,
		});
	};

	updatePassword = async (
		req: Request<ParamsDictionary, unknown, UpdatePasswordInput>,
		res: Response,
	) => {
		const authUser = getAuthenticatedUser(req);

		await this.service.updatePassword(authUser.id, req.body);

		res.sendStatus(204);
	};
}

export default UserController;
