import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Express,
	type NextFunction,
	type Request,
	type Response,
} from "express";
import helmet from "helmet";
import morgan from "morgan";
import {
	corsOptions,
	errorHandler,
	notFoundHandler,
} from "./common/middleware/index.js";
import { env } from "./config/env.js";
import {
	AuthController,
	AuthRepository,
	AuthService,
	authRoutes,
	RefreshTokenRepository,
} from "./features/auth/index.js";
import { prisma } from "./lib/prisma.js";

// Repositories
const authRepository = new AuthRepository(prisma);
const refreshTokenRepository = new RefreshTokenRepository(prisma);

// Services
const authService = new AuthService(authRepository, refreshTokenRepository);

// Controller
const authController = new AuthController(authService);

const app: Express = express();

// Security
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Logger
app.use(morgan("dev"));

// Routes
app.get("/", (_req: Request, res: Response, _next: NextFunction) => {
	res.send("Hello World");
});

app.get("/health", (_req: Request, res: Response, _next: NextFunction) => {
	res.status(200).json({
		status: "ok",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		environment: env.NODE_ENV,
	});
});

app.use("/api/auth", authRoutes(authController));

// Not Found Handler
app.use(notFoundHandler);

// Error Handler
app.use(errorHandler);

export default app;
