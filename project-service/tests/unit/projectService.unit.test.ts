import { describe, it, expect } from "vitest";
import { datesAreValid, parseBudgetOrDefault } from "../../src/service/projectService.js";

describe("datesAreValid", () => {
    it("retourne true pour deux dates valides avec start <= due", () => {
        expect(datesAreValid(new Date("2024-01-01"), new Date("2024-12-31"))).toBe(true);
    });

    it("retourne true si start === due", () => {
        const d = new Date("2024-06-01");
        expect(datesAreValid(d, d)).toBe(true);
    });

    it("retourne false si start > due", () => {
        expect(datesAreValid(new Date("2024-12-31"), new Date("2024-01-01"))).toBe(false);
    });

    it("retourne false si startDate est null", () => {
        expect(datesAreValid(null, new Date("2024-12-31"))).toBe(false);
    });

    it("retourne false si dueDate est null", () => {
        expect(datesAreValid(new Date("2024-01-01"), null)).toBe(false);
    });

    it("retourne false si une date dépasse 2100", () => {
        expect(datesAreValid(new Date("2024-01-01"), new Date("2101-01-01"))).toBe(false);
    });

    it("retourne false pour une date invalide (NaN)", () => {
        expect(datesAreValid(new Date("invalide"), new Date("2024-01-01"))).toBe(false);
    });
});

describe("parseBudgetOrDefault", () => {
    it("retourne 0 pour undefined", () => expect(parseBudgetOrDefault(undefined)).toBe(0));
    it("retourne 0 pour null", () => expect(parseBudgetOrDefault(null)).toBe(0));
    it("retourne le nombre si number", () => expect(parseBudgetOrDefault(500)).toBe(500));
    it("parse une string numérique", () => expect(parseBudgetOrDefault("1500.50")).toBe(1500.5));
    it("retourne 0 pour une string non numérique", () => expect(parseBudgetOrDefault("abc")).toBe(0));
});
