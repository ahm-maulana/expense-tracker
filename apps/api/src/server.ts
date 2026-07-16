import app from "./app.js";

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
	console.log(`
        🚀 Server started successfully
        🌐 URL: http://localhost:${PORT}
        📦 Environment: ${process.env.NODE_ENV ?? "development"}
        `);
});

process.on("SIGINT", async () => {
	server.close(() => {
		console.log("Server closed");
		process.exit(0);
	});
});

process.on("SIGTERM", async () => {
	server.close(() => {
		console.log("Server closed");
		process.exit(0);
	});
});
