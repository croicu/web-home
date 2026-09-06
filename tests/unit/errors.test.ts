import { afterEach, describe, expect, it } from "vitest";
import { AppError, fail } from "../../src/errors";
import { setLogger, resetLogger } from "../../src/services";
import { StubLogger } from "../stubs/stubLogger";

describe("fail()", () => {
    afterEach(() => {
        resetLogger();
    });

    it("throws an AppError carrying the given code and message", () => {
        setLogger(new StubLogger());

        expect(() => fail("thing.missing", "The thing is missing.")).toThrow(AppError);

        try {
            fail("thing.missing", "The thing is missing.");
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);
            expect((err as AppError).code).toBe("thing.missing");
            expect((err as AppError).message).toBe("The thing is missing.");
        }
    });

    it("logs an error before throwing", () => {
        const logger = new StubLogger();
        setLogger(logger);

        expect(() => fail("thing.missing", "The thing is missing.")).toThrow();

        expect(logger.errorCalls).toHaveLength(1);
        expect(logger.errorCalls[0].message).toBe("thing.missing");
    });
});
