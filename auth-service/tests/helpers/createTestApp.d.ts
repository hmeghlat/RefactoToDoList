import type { Pool as Connection } from "mysql2";
export declare const createMockDb: () => Connection & {
    _mockPromise: {
        query: import("vitest").Mock<import("@vitest/spy").Procedure>;
        execute: import("vitest").Mock<import("@vitest/spy").Procedure>;
    };
};
export declare const createTestApp: (db?: Connection) => {
    app: import("express-serve-static-core").Express;
    db: Connection;
};
//# sourceMappingURL=createTestApp.d.ts.map