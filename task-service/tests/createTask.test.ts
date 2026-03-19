import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers/createTestApp.js";

const mockProjectFetch = (status = "IN_PROGRESS") => {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ project: { startDate: null, dueDate: null, status } }),
			text: async () => "",
		}),
	);
};

const TASK = {
	projectId: 1,
	userId: 1,
	name: "Ma tâche",
};

describe("POST /tasks", () => {
	let app: ReturnType<typeof createTestApp>["app"];
	let rabbit: ReturnType<typeof createTestApp>["rabbit"];

	beforeEach(() => {
		({ app, rabbit } = createTestApp());
		mockProjectFetch();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("création avec données minimales → 201 + tâche", async () => {
		const res = await request(app).post("/tasks").send(TASK);

		expect(res.status).toBe(201);
		expect(res.body.task).toMatchObject({
			name: TASK.name,
			projectId: TASK.projectId,
			userId: TASK.userId,
			priority: "MEDIUM",
			status: "TODO",
		});
	});

	it("création avec tous les champs → 201", async () => {
		const res = await request(app).post("/tasks").send({
			...TASK,
			description: "Une description",
			priority: "HIGH",
			status: "IN_PROGRESS",
		});

		expect(res.status).toBe(201);
		expect(res.body.task).toMatchObject({
			description: "Une description",
			priority: "HIGH",
			status: "IN_PROGRESS",
		});
	});

	it("projectId manquant → 400", async () => {
		const res = await request(app).post("/tasks").send({ userId: 1, name: "Test" });

		expect(res.status).toBe(400);
	});

	it("userId manquant → 400", async () => {
		const res = await request(app).post("/tasks").send({ projectId: 1, name: "Test" });

		expect(res.status).toBe(400);
	});

	it("name manquant → 400", async () => {
		const res = await request(app).post("/tasks").send({ projectId: 1, userId: 1 });

		expect(res.status).toBe(400);
	});

	it("priority invalide → 400", async () => {
		const res = await request(app).post("/tasks").send({ ...TASK, priority: "ULTRA" });

		expect(res.status).toBe(400);
	});

	it("status invalide → 400", async () => {
		const res = await request(app).post("/tasks").send({ ...TASK, status: "BLOQUEE" });

		expect(res.status).toBe(400);
	});

	it("dueDate invalide → 400", async () => {
		const res = await request(app).post("/tasks").send({ ...TASK, dueDate: "pas-une-date" });

		expect(res.status).toBe(400);
	});

	it("publie l'événement TaskCreated", async () => {
		await request(app).post("/tasks").send(TASK);

		expect(rabbit.publishEvent).toHaveBeenCalledWith(
			expect.objectContaining({ type: "TaskCreated" }),
		);
	});
});
