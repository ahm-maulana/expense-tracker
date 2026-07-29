import type { CategoryType } from "../../generated/prisma/enums.js";

export const validCategoryIncomeInput = {
	name: "Salary",
	type: "INCOME" as CategoryType,
};

export const validCategoryExpenseInput = {
	name: "Food",
	type: "EXPENSE" as CategoryType,
};
