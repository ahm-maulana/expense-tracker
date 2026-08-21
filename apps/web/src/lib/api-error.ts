export class ApiError extends Error {
	constructor(
		public status: number,
		public data: unknown,
		message: string,
		public headers?: Headers,
	) {
		super(message);
		this.name = "ApiError";
	}
}
