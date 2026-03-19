import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers/createTestApp.js";

const PROJECT = {
	name: "Mon projet",
	startDate: "2030-01-01",
	dueDate: "2030-12-31",
};

describe("POST /projects/create", () => {
	let app: ReturnType<typeof createTestApp>["app"];

	beforeEach(() => {
		({ app } = createTestApp());
	});

	it("création avec données minimales → 201 + projet", async () => {
		const res = await request(app).post("/projects/create").send(PROJECT);

		expect(res.status).toBe(201);
		expect(res.body.project).toMatchObject({
			name: PROJECT.name,
			ownerUserId: 1,
			status: "NOT_STARTED",
			budget: 0,
		});
	});

	it("création avec tous les champs → 201", async () => {
		const res = await request(app).post("/projects/create").send({
			...PROJECT,
			description: "Une description",
			budget: 5000,
			status: "IN_PROGRESS",
		});

		expect(res.status).toBe(201);
		expect(res.body.project).toMatchObject({
			name: PROJECT.name,
			description: "Une description",
			budget: 5000,
			status: "IN_PROGRESS",
		});
	});

	it("name manquant → 400", async () => {
		const res = await request(app).post("/projects/create").send({
			startDate: PROJECT.startDate,
			dueDate: PROJECT.dueDate,
		});

		expect(res.status).toBe(400);
	});

	it("nom en double pour le même user → 409", async () => {
		await request(app).post("/projects/create").send(PROJECT);
		const res = await request(app).post("/projects/create").send(PROJECT);

		expect(res.status).toBe(409);
	});

	it("startDate > dueDate → 400", async () => {
		const res = await request(app).post("/projects/create").send({
			name: PROJECT.name,
			startDate: "2030-12-31",
			dueDate: "2030-01-01",
		});

		expect(res.status).toBe(400);
	});

	it("date invalide → 400", async () => {
		const res = await request(app).post("/projects/create").send({
			name: PROJECT.name,
			startDate: "pas-une-date",
			dueDate: "2030-12-31",
		});

		expect(res.status).toBe(400);
	});

	it("status invalide → ignoré (utilise NOT_STARTED par défaut)", async () => {
		const res = await request(app).post("/projects/create").send({
			...PROJECT,
			status: "INVALIDE",
		});

		expect(res.status).toBe(201);
		expect(res.body.project.status).toBe("NOT_STARTED");
	});
});
