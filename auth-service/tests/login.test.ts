	import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers/createTestApp.js";

const USER = {
	email: "olivier.dick@test.com",
	password: "Password123",
	firstName: "Olivier",
	lastName: "Dick",
};

describe("POST /auth/login", () => {
	let app: ReturnType<typeof createTestApp>["app"];

	beforeEach(async () => {
		({ app } = createTestApp());
		await request(app).post("/auth/register").send(USER);
	});

	it("identifiants valides → 200 + user + token JWT", async () => {
		const res = await request(app).post("/auth/login").send({
			email: USER.email,
			password: USER.password,
		});

		expect(res.status).toBe(200);
		expect(res.body.user).toMatchObject({
			email: USER.email,
			firstName: USER.firstName,
			lastName: USER.lastName,
		});
		expect(res.body.token).toBeDefined();
	});

	it("mauvais mot de passe → 401", async () => {
		const res = await request(app).post("/auth/login").send({
			email: USER.email,
			password: "mauvais-password",
		});

		expect(res.status).toBe(401);
	});

	it("email inexistant → 401", async () => {
		const res = await request(app).post("/auth/login").send({
			email: "inconnu@test.com",
			password: USER.password,
		});

		expect(res.status).toBe(401);
	});

	it("email manquant → 400", async () => {
		const res = await request(app).post("/auth/login").send({
			password: USER.password,
		});

		expect(res.status).toBe(400);
	});

	it("password manquant → 400", async () => {
		const res = await request(app).post("/auth/login").send({
			email: USER.email,
		});

		expect(res.status).toBe(400);
	});

	it("token JWT retourné contient le bon userId et email", async () => {
		const res = await request(app).post("/auth/login").send({
			email: USER.email,
			password: USER.password,
		});

		const token = res.body.token as string;
		const payload = JSON.parse(Buffer.from(token.split(".")[1]!, "base64").toString());

		expect(payload.email).toBe(USER.email);
		expect(payload.sub).toBeDefined();
	});
});
