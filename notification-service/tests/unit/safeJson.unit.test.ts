import { describe, it, expect } from "vitest";
import { safeJson } from "../../src/rabbitmq.js";
import type { ConsumeMessage } from "amqplib";

const makeMsg = (content: string): ConsumeMessage =>
    ({ content: Buffer.from(content, "utf8") } as ConsumeMessage);

describe("safeJson", () => {
    it("parse un JSON valide", () => {
        const result = safeJson(makeMsg('{"type":"task.created","data":{}}'));
        expect(result).toEqual({ type: "task.created", data: {} });
    });

    it("retourne { raw } pour un JSON invalide", () => {
        const result = safeJson(makeMsg("pas du json")) as Record<string, unknown>;
        expect(result.raw).toBe("pas du json");
    });

    it("parse un JSON vide {}", () => {
        const result = safeJson(makeMsg("{}"));
        expect(result).toEqual({});
    });

    it("parse un tableau JSON", () => {
        const result = safeJson(makeMsg("[1,2,3]"));
        expect(result).toEqual([1, 2, 3]);
    });

    it("retourne { raw } pour une string simple (non-JSON)", () => {
        const result = safeJson(makeMsg("Connexion WebSocket établie")) as Record<string, unknown>;
        expect(result.raw).toBe("Connexion WebSocket établie");
    });
});
