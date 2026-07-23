import { afterAll, beforeEach } from "vitest";
import { prisma } from "../../lib/prisma.js";
import { cleanDatabase } from "./database.js";

beforeEach(async () => {
	await cleanDatabase();
});

afterAll(async () => {
	await prisma.$disconnect();
});
