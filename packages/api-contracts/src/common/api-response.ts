export interface ApiResponse<T> {
	data: T;
	message?: string;
	meta?: PaginationMeta;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	totalItems: number;
	totalPages: number;
}

export interface ApiErrorResponse {
	message: string;
	errors?: Record<string, string[]>;
}
