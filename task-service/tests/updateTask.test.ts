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

const TASK = { projectId: 1, userId: 1, name: "Ma tâche" };

describe("PUT /tasks/:id", () => {
	let app: ReturnType<typeof createTestApp>["app"];
	let rabbit: ReturnType<typeof createTestApp>["rabbit"];
	let taskId: number;

	beforeEach(async () => {
		({ app, rabbit } = createTestApp());
		mockProjectFetch();
		const res = await request(app).post("/tasks").send(TASK);
		taskId = res.body.task.id as number;
	});

	afterEach(() => vi.unstubAllGlobals());

	it("mise à jour du nom → 200", async () => {
		const res = await request(app).put(`/tasks/${taskId}`).send({ name: "Nouveau nom" });

		expect(res.status).toBe(200);
		expect(res.body.task.name).toBe("Nouveau nom");
	});

	it("mise à jour de la priorité → 200", async () => {
		const res = await request(app).put(`/tasks/${taskId}`).send({ priority: "HIGH" });

		expect(res.status).toBe(200);
		expect(res.body.task.priority).toBe("HIGH");
	});

	it("mise à jour du statut → 200", async () => {
		const res = await request(app).put(`/tasks/${taskId}`).send({ status: "IN_PROGRESS" });

		expect(res.status).toBe(200);
		expect(res.body.task.status).toBe("IN_PROGRESS");
	});

	it("name vide → 400", async () => {
		const res = await request(app).put(`/tasks/${taskId}`).send({ name: "" });

		expect(res.status).toBe(400);
	});

	it("priority invalide → 400", async () => {
		const res = await request(app).put(`/tasks/${taskId}`).send({ priority: "ULTRA" });

		expect(res.status).toBe(400);
	});

	it("status invalide → 400", async () => {
		const res = await request(app).put(`/tasks/${taskId}`).send({ status: "BLOQUEE" });

		expect(res.status).toBe(400);
	});

	it("tâche inexistante → 404", async () => {
		const res = await request(app).put("/tasks/99999").send({ name: "Test" });

		expect(res.status).toBe(404);
	});

	it("id invalide → 400", async () => {
		const res = await request(app).put("/tasks/abc").send({ name: "Test" });

		expect(res.status).toBe(400);
	});

	it("projet DONE → bloque la modification → 422", async () => {
		vi.unstubAllGlobals();
		mockProjectFetch("DONE");

		const res = await request(app).put(`/tasks/${taskId}`).send({ name: "Test" });

		expect(res.status).toBe(422);
	});

	it("passage en DONE → publie TaskCompleted", async () => {
		await request(app).put(`/tasks/${taskId}`).send({ status: "DONE" });

		expect(rabbit.publishEvent).toHaveBeenCalledWith(
			expect.objectContaining({ type: "TaskCompleted" }),
		);
	});

	it("passage en IN_PROGRESS → publie TaskStarted", async () => {
		await request(app).put(`/tasks/${taskId}`).send({ status: "IN_PROGRESS" });

		expect(rabbit.publishEvent).toHaveBeenCalledWith(
			expect.objectContaining({ type: "TaskStarted" }),
		);
	});

	it("passage en CANCELLED → publie TaskCancelled", async () => {
		await request(app).put(`/tasks/${taskId}`).send({ status: "CANCELLED" });

		expect(rabbit.publishEvent).toHaveBeenCalledWith(
			expect.objectContaining({ type: "TaskCancelled" }),
		);
	});

	it("passage en TODO → publie TaskReopened", async () => {
		await request(app).put(`/tasks/${taskId}`).send({ status: "IN_PROGRESS" });
		rabbit.publishEvent.mockClear();

		await request(app).put(`/tasks/${taskId}`).send({ status: "TODO" });

		expect(rabbit.publishEvent).toHaveBeenCalledWith(
			expect.objectContaining({ type: "TaskReopened" }),
		);
	});
});
