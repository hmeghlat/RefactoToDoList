import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers/createTestApp.js";

describe("POST /auth/register", () => {
	let app: ReturnType<typeof createTestApp>["app"];
	let sqlite: ReturnType<typeof createTestApp>["sqlite"];

	beforeEach(() => {
		({ app, sqlite } = createTestApp());
	});

	it("inscription avec données valides → 201 + user + token", async () => {
		const res = await request(app).post("/auth/register").send({
			email: "olivier.dick@test.com",
			password: "Password123",
			firstName: "Olivier",
			lastName: "Dick",
		});

		expect(res.status).toBe(201);
		expect(res.body.user).toMatchObject({
			email: "olivier.dick@test.com",
			firstName: "Olivier",
			lastName: "Dick",
		});
		expect(res.body.user.password).toBeUndefined();
		expect(res.body.token).toBeDefined();
	});

	it("email déjà utilisé → 409", async () => {
		const payload = { email: "olivier.dick@test.com", password: "Password123", firstName: "Olivier", lastName: "Dick" };

		await request(app).post("/auth/register").send(payload);
		const res = await request(app).post("/auth/register").send(payload);

		expect(res.status).toBe(409);
		expect(res.body.message).toBe("Email already registered");
	});

	it("email manquant → 400", async () => {
		const res = await request(app).post("/auth/register").send({
			password: "Password123",
			firstName: "Olivier",
			lastName: "Dick",
		});

		expect(res.status).toBe(400);
	});

	it("password manquant → 400", async () => {
		const res = await request(app).post("/auth/register").send({
			email: "olivier.dick@test.com",
			firstName: "Olivier",
			lastName: "Dick",
		});

		expect(res.status).toBe(400);
	});

	it("firstName manquant → 400", async () => {
		const res = await request(app).post("/auth/register").send({
			email: "olivier.dick@test.com",
			password: "Password123",
			lastName: "Dick",
		});

		expect(res.status).toBe(400);
	});

	it("lastName manquant → 400", async () => {
		const res = await request(app).post("/auth/register").send({
			email: "olivier.dick@test.com",
			password: "Password123",
			firstName: "Olivier",
		});

		expect(res.status).toBe(400);
	});

	it("email format invalide → 400", async () => {
		const res = await request(app).post("/auth/register").send({
			email: "pas-un-email",
			password: "Password123",
			firstName: "Olivier",
			lastName: "Dick",
		});

		expect(res.status).toBe(400);
	});

	it("password stocké hashé en base (non en clair)", async () => {
		await request(app).post("/auth/register").send({
			email: "olivier.dick@test.com",
			password: "Password123",
			firstName: "Olivier",
			lastName: "Dick",
		});

		const row = sqlite.prepare("SELECT password_hash FROM users WHERE email = ?").get("olivier.dick@test.com") as { password_hash: string };

		expect(row).toBeDefined();
		expect(row.password_hash).not.toBe("password123");
		expect(row.password_hash).toMatch(/^\$2[ab]\$/);
	});
});
