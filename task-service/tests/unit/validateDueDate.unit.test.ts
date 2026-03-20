import { describe, it, expect } from "vitest";
import { validateDueDateAgainstProject } from "../../src/service/projectServiceClient.js";

describe("validateDueDateAgainstProject", () => {
    it("retourne null si aucune date de projet définie", () => {
        const result = validateDueDateAgainstProject(new Date("2024-06-15"), {
            startDate: null,
            dueDate: null,
        });
        expect(result).toBeNull();
    });

    it("retourne null si la date est dans la plage du projet", () => {
        const result = validateDueDateAgainstProject(new Date("2024-06-15"), {
            startDate: "2024-01-01",
            dueDate: "2024-12-31",
        });
        expect(result).toBeNull();
    });

    it("retourne une erreur si la date est avant le début du projet", () => {
        const result = validateDueDateAgainstProject(new Date("2023-12-31"), {
            startDate: "2024-01-01",
            dueDate: null,
        });
        expect(result).not.toBeNull();
        expect(result).toContain("2023-12-31");
        expect(result).toContain("2024-01-01");
    });

    it("retourne une erreur si la date est après la fin du projet", () => {
        const result = validateDueDateAgainstProject(new Date("2025-01-01"), {
            startDate: null,
            dueDate: "2024-12-31",
        });
        expect(result).not.toBeNull();
        expect(result).toContain("2025-01-01");
        expect(result).toContain("2024-12-31");
    });

    it("accepte une date égale au début du projet", () => {
        const result = validateDueDateAgainstProject(new Date("2024-01-01"), {
            startDate: "2024-01-01",
            dueDate: null,
        });
        expect(result).toBeNull();
    });

    it("accepte une date égale à la fin du projet", () => {
        const result = validateDueDateAgainstProject(new Date("2024-12-31"), {
            startDate: null,
            dueDate: "2024-12-31",
        });
        expect(result).toBeNull();
    });
});
