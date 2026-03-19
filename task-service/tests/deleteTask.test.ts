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

describe("DELETE /tasks/:id", () => {
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

	it("suppression → 204", async () => {
		const res = await request(app).delete(`/tasks/${taskId}`);

		expect(res.status).toBe(204);
	});

	it("tâche supprimée n'est plus accessible → 404", async () => {
		await request(app).delete(`/tasks/${taskId}`);
		const res = await request(app).get(`/tasks/${taskId}`);

		expect(res.status).toBe(404);
	});

	it("tâche inexistante → 404", async () => {
		const res = await request(app).delete("/tasks/99999");

		expect(res.status).toBe(404);
	});

	it("id invalide → 400", async () => {
		const res = await request(app).delete("/tasks/abc");

		expect(res.status).toBe(400);
	});

	it("publie l'événement TaskDeleted", async () => {
		await request(app).delete(`/tasks/${taskId}`);

		expect(rabbit.publishEvent).toHaveBeenCalledWith(
			expect.objectContaining({ type: "TaskDeleted" }),
		);
	});
});
