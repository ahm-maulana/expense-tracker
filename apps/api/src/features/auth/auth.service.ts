import { randomUUID } from "node:crypto";
import type {
	LoginInput,
	LoginResponse,
	RegisterInput,
} from "@repo/api-contracts";
import bcrypt from "bcrypt";
import {
	ConflictError,
	UnauthorizedError,
} from "../../common/errors/app-error.js";
import {
	decodeToken,
	signAccessToken,
	signRefreshToken,
} from "../../lib/jwt.js";
import type AuthRepository from "./auth.repository.js";
import type { AccessTokenPayload, RefreshTokenPayload } from "./auth.types.js";
import type RefreshTokenRepository from "./refresh-token-repository.js";

class AuthService {
	constructor(
		private authRepository: AuthRepository,
		private refreshTokenRepository: RefreshTokenRepository,
	) {}

	async register(data: RegisterInput): Promise<void> {
		const existingUser = await this.authRepository.findByEmail(data.email);

		if (existingUser) {
			throw new ConflictError("Email already exists");
		}

		const hashedPassword = await bcrypt.hash(data.password, 10);

		const { name, email } = data;

		this.authRepository.create({
			name,
			email,
			passwordHash: hashedPassword,
		});
	}

	async login(data: LoginInput): Promise<LoginResponse> {
		const existingUser = await this.authRepository.findByEmail(data.email);

		if (!existingUser) {
			throw new UnauthorizedError("Invalid email or password");
		}

		const isPasswordMatch = await bcrypt.compare(
			data.password,
			existingUser.passwordHash,
		);

		if (!isPasswordMatch) {
			throw new UnauthorizedError("Invalid email or password");
		}

		const generatedAccessToken = signAccessToken<AccessTokenPayload>({
			sub: existingUser.id,
		});

		const jti = randomUUID();

		const generatedRefreshToken = signRefreshToken<RefreshTokenPayload>({
			sub: existingUser.id,
			jti,
		});

		const { exp } = decodeToken(generatedRefreshToken);
		const expiredDate = exp
			? new Date(exp)
			: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

		await this.refreshTokenRepository.create({
			userId: existingUser.id,
			jti,
			expiresAt: expiredDate,
		});

		return {
			user: {
				id: existingUser.id,
				name: existingUser.name,
				email: existingUser.email,
			},
			accessToken: generatedAccessToken,
		};
	}
}

export default AuthService;
