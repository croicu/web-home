import { describe, expect, it } from "vitest";
import { DefaultLogger, LogCategory } from "../../src/logging";
import { StubTelemetrySink } from "../stubs/stubTelemetrySink";

describe("DefaultLogger category filtering", () => {
    it("shows only the default category when no allow-list or debug is given", () => {
        const sink = new StubTelemetrySink();
        const logger = new DefaultLogger(sink);

        logger.info("general.message", undefined, LogCategory.General);
        logger.info("other.message", undefined, "other");

        expect(sink.records.map((r) => r.message)).toEqual(["general.message"]);
    });

    it("shows every category when showAllCategories is set and no explicit allow-list is given", () => {
        const sink = new StubTelemetrySink();
        const logger = new DefaultLogger(sink, null, true);

        logger.info("general.message", undefined, LogCategory.General);
        logger.info("other.message", undefined, "other");

        expect(sink.records.map((r) => r.message)).toEqual(["general.message", "other.message"]);
    });

    it("restricts to an explicit allow-list when showAllCategories is false", () => {
        // showAllCategories bypasses the allow-list unconditionally at this level -- keeping the
        // two mutually exclusive is Context's job (it only sets showAllCategories=true when no
        // explicit ?logCategory= was given). See CLAUDE.md's Log Categories precedence rule.
        const sink = new StubTelemetrySink();
        const logger = new DefaultLogger(sink, ["only-this"], false);

        logger.info("allowed.message", undefined, "only-this");
        logger.info("blocked.message", undefined, "other");

        expect(sink.records.map((r) => r.message)).toEqual(["allowed.message"]);
    });

    it("lets excludedCategories suppress a category even under showAllCategories", () => {
        const sink = new StubTelemetrySink();
        const logger = new DefaultLogger(sink, null, true, ["noisy"]);

        logger.info("kept.message", undefined, "kept");
        logger.info("suppressed.message", undefined, "noisy");

        expect(sink.records.map((r) => r.message)).toEqual(["kept.message"]);
    });
});
