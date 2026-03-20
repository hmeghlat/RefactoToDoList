import { describe, it, expect } from "vitest";
import { parsePositiveInt, parseNullableDate } from "../../src/service/taskService.js";

describe("parsePositiveInt", () => {
    it("retourne le nombre si entier positif", () => expect(parsePositiveInt(5)).toBe(5));
    it("retourne null pour 0", () => expect(parsePositiveInt(0)).toBeNull());
    it("retourne null pour un entier négatif", () => expect(parsePositiveInt(-1)).toBeNull());
    it("retourne null pour un float", () => expect(parsePositiveInt(1.5)).toBeNull());
    it("parse une string entière positive", () => expect(parsePositiveInt("10")).toBe(10));
    it("retourne null pour une string vide", () => expect(parsePositiveInt("")).toBeNull());
    it("retourne null pour null", () => expect(parsePositiveInt(null)).toBeNull());
});

describe("parseNullableDate", () => {
    it("retourne undefined si value est undefined", () => {
        expect(parseNullableDate(undefined)).toBeUndefined();
    });

    it("retourne null si value est null", () => {
        expect(parseNullableDate(null)).toBeNull();
    });

    it("retourne la Date si c'est déjà une Date valide", () => {
        const d = new Date("2024-01-01");
        expect(parseNullableDate(d)).toBe(d);
    });

    it("parse une string de date valide", () => {
        const result = parseNullableDate("2024-06-15");
        expect(result).toBeInstanceOf(Date);
    });

    it("retourne null pour une string vide", () => {
        expect(parseNullableDate("")).toBeNull();
    });

    it("retourne undefined pour une string invalide", () => {
        expect(parseNullableDate("pas-une-date")).toBeUndefined();
    });
});
