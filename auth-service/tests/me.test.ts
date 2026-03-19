import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createTestApp } from "./helpers/createTestApp.js";

const USER = {
	email: "olivier.dick@test.com",
	password: "password123",
	firstName: "Olivier",
	lastName: "Dick",
};

describe("GET /auth/me", () => {
	let app: ReturnType<typeof createTestApp>["app"];
	let token: string;

	beforeEach(async () => {
		({ app } = createTestApp());
		await request(app).post("/auth/register").send(USER);
		const loginRes = await request(app).post("/auth/login").send({
			email: USER.email,
			password: USER.password,
		});
		token = loginRes.body.token as string;
	});

	it("token valide → 200 + user", async () => {
		const res = await request(app).get("/auth/me").set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body.user).toMatchObject({
			email: USER.email,
			firstName: USER.firstName,
			lastName: USER.lastName,
		});
	});

	it("sans token → 401", async () => {
		const res = await request(app).get("/auth/me");

		expect(res.status).toBe(401);
	});

	it("token expiré → 401", async () => {
		const expiredToken = jwt.sign(
			{ sub: "1", email: USER.email, exp: Math.floor(Date.now() / 1000) - 3600 },
			"test-secret-key"
		);

		const res = await request(app).get("/auth/me").set("Authorization", `Bearer ${expiredToken}`);

		expect(res.status).toBe(401);
	});

	it("token malformé → 401", async () => {
		const res = await request(app).get("/auth/me").set("Authorization", "Bearer token-invalide");

		expect(res.status).toBe(401);
	});

	it("userId dans le token inexistant en base → 404", async () => {
		const fakeToken = jwt.sign({ sub: "99999", email: "fantome@test.com" }, "test-secret-key");

		const res = await request(app).get("/auth/me").set("Authorization", `Bearer ${fakeToken}`);

		expect(res.status).toBe(404);
	});
});
