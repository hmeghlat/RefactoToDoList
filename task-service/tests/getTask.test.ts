import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers/createTestApp.js";

const mockProjectFetch = () => {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ project: { startDate: null, dueDate: null, status: "IN_PROGRESS" } }),
			text: async () => "",
		}),
	);
};

const TASK = { projectId: 1, userId: 1, name: "Ma tâche" };

describe("GET /tasks", () => {
	let app: ReturnType<typeof createTestApp>["app"];

	beforeEach(() => {
		({ app } = createTestApp());
		mockProjectFetch();
	});

	afterEach(() => vi.unstubAllGlobals());

	it("retourne toutes les tâches → 200", async () => {
		await request(app).post("/tasks").send(TASK);
		await request(app).post("/tasks").send({ ...TASK, name: "Tâche 2" });

		const res = await request(app).get("/tasks");

		expect(res.status).toBe(200);
		expect(res.body.tasks).toHaveLength(2);
	});

	it("filtre par projectId → 200", async () => {
		await request(app).post("/tasks").send({ ...TASK, projectId: 1 });
		await request(app).post("/tasks").send({ ...TASK, name: "Autre projet", projectId: 2 });

		const res = await request(app).get("/tasks?projectId=1");

		expect(res.status).toBe(200);
		expect(res.body.tasks).toHaveLength(1);
		expect(res.body.tasks[0].projectId).toBe(1);
	});

	it("liste vide → 200 avec []", async () => {
		const res = await request(app).get("/tasks");

		expect(res.status).toBe(200);
		expect(res.body.tasks).toHaveLength(0);
	});
});

describe("GET /tasks/:id", () => {
	let app: ReturnType<typeof createTestApp>["app"];

	beforeEach(() => {
		({ app } = createTestApp());
		mockProjectFetch();
	});

	afterEach(() => vi.unstubAllGlobals());

	it("tâche existante → 200 + tâche", async () => {
		const created = await request(app).post("/tasks").send(TASK);
		const id = created.body.task.id as number;

		const res = await request(app).get(`/tasks/${id}`);

		expect(res.status).toBe(200);
		expect(res.body.task).toMatchObject({ id, name: TASK.name });
	});

	it("tâche inexistante → 404", async () => {
		const res = await request(app).get("/tasks/99999");

		expect(res.status).toBe(404);
	});

	it("id invalide → 400", async () => {
		const res = await request(app).get("/tasks/abc");

		expect(res.status).toBe(400);
	});
});
