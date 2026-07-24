import { Router } from "express";
import {
	updatePasswordSchema,
	updateUserSchema,
} from "../../../../../packages/api-contracts/src/user/user.schemas.js";
import { authenticate } from "../../common/middleware/authenticate.js";
import { validateBody } from "../../common/middleware/validation.js";
import type UserController from "./user.controller.js";

export default function userRoutes(controller: UserController) {
	const router = Router();

	router.get("/me", authenticate, controller.getMe);
	router.patch(
		"/me",
		authenticate,
		validateBody(updateUserSchema),
		controller.updateProfile,
	);
	router.patch(
		"/me/password",
		authenticate,
		validateBody(updatePasswordSchema),
		controller.updatePassword,
	);

	return router;
}
