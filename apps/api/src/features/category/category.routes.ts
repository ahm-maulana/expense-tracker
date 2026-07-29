import {
	categoryQuerySchema,
	createCategorySchema,
	uuidParamSchema,
} from "@repo/api-contracts";
import { Router } from "express";
import { authenticate } from "../../common/middleware/authenticate.js";
import {
	validateBody,
	validateParams,
	validateQuery,
} from "../../common/middleware/validation.js";
import type CategoryController from "./category.controller.js";

export function categoryRoutes(controller: CategoryController): Router {
	const router = Router();

	router.use(authenticate);

	router.get("/", validateQuery(categoryQuerySchema), controller.getAll);
	router.get("/:id", validateParams(uuidParamSchema), controller.getById);
	router.post("/", validateBody(createCategorySchema), controller.create);
	router.patch(
		"/:id",
		validateParams(uuidParamSchema),
		validateBody(createCategorySchema),
		controller.update,
	);
	router.delete("/:id", validateParams(uuidParamSchema), controller.delete);

	return router;
}
