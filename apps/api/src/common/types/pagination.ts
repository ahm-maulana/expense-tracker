import type { PaginationMeta } from "@repo/api-contracts";

export interface PaginatedResult<T> {
	items: T[];
	pagination: PaginationMeta;
}
