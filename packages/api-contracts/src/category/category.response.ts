export interface CategoryDto {
	id: string;
	name: string;
	type: "EXPENSE" | "INCOME";
	createdAt: Date;
}
