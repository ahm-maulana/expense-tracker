export interface LoginResponse {
	user: {
		id: string;
		name: string;
		email: string;
	};
	accessToken: string;
}
