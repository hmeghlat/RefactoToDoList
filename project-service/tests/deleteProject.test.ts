import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createTestApp } from "./helpers/createTestApp.js";

const PROJECT = {
	name: "Mon projet",
	startDate: "2030-01-01",
	dueDate: "2030-12-31",
};

const mockFetch = (tasks: unknown[]) => {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ tasks }),
			text: async () => "",
		}),
	);
};

describe("DELETE /projects/:id", () => {
	let app: ReturnType<typeof createTestApp>["app"];
	let projectId: number;

	beforeEach(async () => {
		({ app } = createTestApp());
		const res = await request(app).post("/projects/create").send(PROJECT);
		projectId = res.body.project.id as number;
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("projet sans tâches → 204", async () => {
		mockFetch([]);

		const res = await request(app).delete(`/projects/${projectId}`);

		expect(res.status).toBe(204);
	});

	it("toutes les tâches DONE → 204", async () => {
		mockFetch([{ status: "DONE" }, { status: "DONE" }]);

		const res = await request(app).delete(`/projects/${projectId}`);

		expect(res.status).toBe(204);
	});

	it("tâches non terminées sans force → 409", async () => {
		mockFetch([{ status: "TODO", name: "Tâche 1" }, { status: "DONE" }]);

		const res = await request(app).delete(`/projects/${projectId}`);

		expect(res.status).toBe(409);
	});

	it("tâches non terminées avec force=true → 204", async () => {
		mockFetch([{ status: "TODO", name: "Tâche 1" }]);

		const res = await request(app).delete(`/projects/${projectId}?force=true`);

		expect(res.status).toBe(204);
	});

	it("projet inexistant → 404", async () => {
		mockFetch([]);

		const res = await request(app).delete("/projects/99999");

		expect(res.status).toBe(404);
	});

	it("id invalide → 400", async () => {
		const res = await request(app).delete("/projects/abc");

		expect(res.status).toBe(400);
	});

	it("projet supprimé n'est plus accessible → 404", async () => {
		mockFetch([]);

		await request(app).delete(`/projects/${projectId}`);
		const res = await request(app).get(`/projects/${projectId}`);

		expect(res.status).toBe(404);
	});
});
