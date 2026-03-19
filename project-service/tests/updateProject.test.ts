import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers/createTestApp.js";

const PROJECT = {
	name: "Mon projet",
	startDate: "2030-01-01",
	dueDate: "2030-12-31",
};

describe("PUT /projects/:id", () => {
	let app: ReturnType<typeof createTestApp>["app"];
	let projectId: number;

	beforeEach(async () => {
		({ app } = createTestApp());
		const res = await request(app).post("/projects/create").send(PROJECT);
		projectId = res.body.project.id as number;
	});

	it("mise à jour du nom → 200", async () => {
		const res = await request(app).put(`/projects/${projectId}`).send({
			name: "Nouveau nom",
			startDate: PROJECT.startDate,
			dueDate: PROJECT.dueDate,
		});

		expect(res.status).toBe(200);
		expect(res.body.project.name).toBe("Nouveau nom");
	});

	it("mise à jour du statut → 200", async () => {
		const res = await request(app).put(`/projects/${projectId}`).send({
			status: "IN_PROGRESS",
			startDate: PROJECT.startDate,
			dueDate: PROJECT.dueDate,
		});

		expect(res.status).toBe(200);
		expect(res.body.project.status).toBe("IN_PROGRESS");
	});

	it("mise à jour du budget → 200", async () => {
		const res = await request(app).put(`/projects/${projectId}`).send({
			budget: 9999,
			startDate: PROJECT.startDate,
			dueDate: PROJECT.dueDate,
		});

		expect(res.status).toBe(200);
		expect(res.body.project.budget).toBe(9999);
	});

	it("projet inexistant → 404", async () => {
		const res = await request(app).put("/projects/99999").send({
			name: "Test",
			startDate: PROJECT.startDate,
			dueDate: PROJECT.dueDate,
		});

		expect(res.status).toBe(404);
	});

	it("id invalide → 400", async () => {
		const res = await request(app).put("/projects/abc").send({ name: "Test" });

		expect(res.status).toBe(400);
	});

	it("startDate > dueDate → 400", async () => {
		const res = await request(app).put(`/projects/${projectId}`).send({
			startDate: "2030-12-31",
			dueDate: "2030-01-01",
		});

		expect(res.status).toBe(400);
	});
});
