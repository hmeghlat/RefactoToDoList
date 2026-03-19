import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers/createTestApp.js";

const PROJECT = {
	name: "Mon projet",
	startDate: "2030-01-01",
	dueDate: "2030-12-31",
};

describe("GET /projects/:id", () => {
	let app: ReturnType<typeof createTestApp>["app"];

	beforeEach(() => {
		({ app } = createTestApp());
	});

	it("projet existant → 200 + projet", async () => {
		const created = await request(app).post("/projects/create").send(PROJECT);
		const id = created.body.project.id as number;

		const res = await request(app).get(`/projects/${id}`);

		expect(res.status).toBe(200);
		expect(res.body.project).toMatchObject({ id, name: PROJECT.name });
	});

	it("projet inexistant → 404", async () => {
		const res = await request(app).get("/projects/99999");

		expect(res.status).toBe(404);
	});

	it("id invalide → 400", async () => {
		const res = await request(app).get("/projects/abc");

		expect(res.status).toBe(400);
	});
});

describe("GET /projects", () => {
	let app: ReturnType<typeof createTestApp>["app"];

	beforeEach(() => {
		({ app } = createTestApp());
	});

	it("retourne tous les projets du user connecté → 200", async () => {
		await request(app).post("/projects/create").send(PROJECT);
		await request(app).post("/projects/create").send({ ...PROJECT, name: "Projet 2" });

		const res = await request(app).get("/projects");

		expect(res.status).toBe(200);
		expect(res.body.projects).toHaveLength(2);
	});

	it("retourne liste vide si aucun projet → 200 avec []", async () => {
		const res = await request(app).get("/projects");

		expect(res.status).toBe(200);
		expect(res.body.projects).toHaveLength(0);
	});
});
