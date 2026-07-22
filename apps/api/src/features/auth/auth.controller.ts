import type {
	ApiResponse,
	LoginInput,
	LoginResponse,
	RegisterInput,
	RegisterResponse,
} from "@repo/api-contracts";
import type { NextFunction, Request, Response } from "express";
import ms, { type StringValue } from "ms";
import { env } from "../../config/env.js";
import type AuthService from "./auth.service.js";

class AuthController {
	constructor(private service: AuthService) {}

	register = async (
		req: Request<object, object, RegisterInput>,
		res: Response<ApiResponse<RegisterResponse>>,
		next: NextFunction,
	) => {
		const { confirmPassword, ...registerFields } = req.body;
		try {
			const user = await this.service.register(registerFields);

			res.status(201).json({
				data: {
					user,
				},
				message: "Account created successfully.",
			});
		} catch (error) {
			next(error);
		}
	};

	login = async (
		req: Request<object, object, LoginInput>,
		res: Response<ApiResponse<LoginResponse>>,
		next: NextFunction,
	) => {
		try {
			const { user, refreshToken, accessToken } = await this.service.login(
				req.body,
			);

			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: ms(env.JWT_REFRESH_EXPIRES_IN as StringValue),
			});

			res.status(200).json({
				data: {
					user: {
						id: user.id,
						email: user.email,
						name: user.name,
					},
					accessToken,
				},
			});
		} catch (error) {
			next(error);
		}
	};

	refresh = async (
		req: Request,
		res: Response<ApiResponse<LoginResponse>>,
		_next: NextFunction,
	) => {
		const refreshToken = req.cookies.refreshToken;

		try {
			const {
				user,
				accessToken,
				refreshToken: newRefreshToken,
			} = await this.service.refresh(refreshToken);

			res.cookie("refreshToken", newRefreshToken, {
				httpOnly: true,
				secure: env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: ms(env.JWT_REFRESH_EXPIRES_IN as StringValue),
			});

			res.status(200).json({
				data: {
					user: {
						id: user.id,
						email: user.email,
						name: user.name,
					},
					accessToken,
				},
			});
		} catch {
			res.clearCookie("refreshToken", {
				httpOnly: true,
				secure: env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: ms(env.JWT_REFRESH_EXPIRES_IN as StringValue),
			});
		}
	};

	logout = async (req: Request, res: Response, _next: NextFunction) => {
		const refreshToken = req.cookies.refreshToken;
		await this.service.logout(refreshToken);
		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: ms(env.JWT_REFRESH_EXPIRES_IN as StringValue),
		});

		res.status(204);
	};
}

export default AuthController;
