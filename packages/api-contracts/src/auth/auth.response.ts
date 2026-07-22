import type { UserDto } from "../user/index.js";

export interface LoginResponse {
	user: UserDto;
	accessToken: string;
}

export interface RegisterResponse {
	user: UserDto;
}
