import {
	forgotPasswordSchema,
	loginSchema,
	registerSchema,
	resetPasswordSchema,
	tokenSchema,
} from "@repo/api-contracts";
import { Router } from "express";
import {
	validateBody,
	validateQuery,
} from "../../common/middleware/validation.js";
import type AuthController from "./auth.controller.js";

export default function authRoutes(controller: AuthController): Router {
	const router = Router();

	router.post("/register", validateBody(registerSchema), controller.register);

	router.post("/login", validateBody(loginSchema), controller.login);

	router.post("/refresh", controller.refresh);

	router.post(
		"/forgot-password",
		validateBody(forgotPasswordSchema),
		controller.forgotPassword,
	);

	router.post(
		"/reset-password",
		validateBody(resetPasswordSchema),
		controller.resetPassword,
	);

	router.get(
		"/reset-password/verify",
		validateQuery(tokenSchema),
		controller.verifyResetPasswordToken,
	);

	router.post("/logout", controller.logout);

	return router;
}
