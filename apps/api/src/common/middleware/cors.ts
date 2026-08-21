import type { CorsOptions } from "cors";

const allowedOrigins = ["http://localhost:3000"];

export const corsOptions: CorsOptions = {
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Blocked by CORS"));
		}
	},
	credentials: true,
	exposedHeaders: ["Retry-After"],
};
