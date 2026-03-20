import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { normalizeEmail, signToken } from "../../src/service/authService.js";
import jwt from "jsonwebtoken";

describe("normalizeEmail", () => {
    it("convertit en minuscules", () => {
        expect(normalizeEmail("OLIVIER@TEST.COM")).toBe("olivier@test.com");
    });

    it("supprime les espaces en début et fin", () => {
        expect(normalizeEmail("  olivier@test.com  ")).toBe("olivier@test.com");
    });

    it("combine trim + lowercase", () => {
        expect(normalizeEmail("  OLIVIER@Test.Com  ")).toBe("olivier@test.com");
    });
});

describe("signToken", () => {
    const originalSecret = process.env.JWT_SECRET;

    beforeEach(() => { process.env.JWT_SECRET = "test-secret"; });
    afterEach(() => { process.env.JWT_SECRET = originalSecret; });

    it("retourne un JWT avec le bon payload", () => {
        const token = signToken({ sub: "42", email: "olivier@test.com" });
        const decoded = jwt.verify(token, "test-secret") as Record<string, unknown>;
        expect(decoded.sub).toBe("42");
        expect(decoded.email).toBe("olivier@test.com");
    });

    it("lève une erreur si JWT_SECRET est absent", () => {
        delete process.env.JWT_SECRET;
        expect(() => signToken({ sub: "1", email: "a@b.com" })).toThrow("JWT_SECRET is missing");
    });
});
