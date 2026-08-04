import type {
	ApiResponse,
	ForgotPasswordInput,
	LoginInput,
	LoginResponse,
	RegisterInput,
	RegisterResponse,
	ResetPasswordInput,
} from "@repo/api-contracts";
import type { NextFunction, Request, Response } from "express";
import ms, { type StringValue } from "ms";
import { getValidatedBody } from "../../common/utils/request.js";
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
		next: NextFunction,
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
		} catch (error) {
			res.clearCookie("refreshToken", {
				httpOnly: true,
				secure: env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: ms(env.JWT_REFRESH_EXPIRES_IN as StringValue),
			});

			next(error);
		}
	};

	forgotPassword = async (req: Request, res: Response<ApiResponse<null>>) => {
		const { email } = getValidatedBody<ForgotPasswordInput>(req);

		await this.service.forgotPassword(email);

		res.status(200).json({
			data: null,
			message:
				"If an account with that email exists, a password reset link has been sent.",
		});
	};

	resetPassword = async (req: Request, res: Response<ApiResponse<null>>) => {
		const data = getValidatedBody<ResetPasswordInput>(req);

		await this.service.resetPassword(data);

		res.status(200).json({
			data: null,
			message: "Password has been reset successfully.",
		});
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

		res.sendStatus(204);
	};
}

export default AuthController;
