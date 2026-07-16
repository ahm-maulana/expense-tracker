import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const server = app.listen(env.PORT, () => {
	console.log(`
        🚀 Server started successfully
        🌐 URL: http://localhost:${env.PORT}
        📦 Environment: ${env.NODE_ENV ?? "development"}
        `);
});

async function gracefulShutdown() {
	console.log("Disconnecting from database...");
	await prisma.$disconnect();
	console.log("Database disconnected successfully.");
	server.close(() => {
		console.log("Server closed");
		process.exit(0);
	});
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
