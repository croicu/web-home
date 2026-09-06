import { afterEach, describe, expect, it } from "vitest";
import { getLogger, resetLogger, setLogger } from "../../src/services";
import { AppError } from "../../src/errors";
import { StubLogger } from "../stubs/stubLogger";

describe("getLogger/setLogger", () => {
    afterEach(() => {
        resetLogger();
    });

    it("throws AppError when no logger has been set", () => {
        expect(() => getLogger()).toThrow(AppError);
    });

    it("returns the logger passed to setLogger", () => {
        const logger = new StubLogger();
        setLogger(logger);

        expect(getLogger()).toBe(logger);
    });

    it("throws again after resetLogger", () => {
        setLogger(new StubLogger());
        resetLogger();

        expect(() => getLogger()).toThrow(AppError);
    });
});
