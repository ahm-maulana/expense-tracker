import express, {
	type Express,
	type NextFunction,
	type Request,
	type Response,
} from "express";

const app: Express = express();

app.get("/", (_req: Request, res: Response, _next: NextFunction) => {
	res.send("Hello World");
});

export default app;
