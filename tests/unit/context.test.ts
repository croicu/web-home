import { afterEach, describe, expect, it, vi } from "vitest";
import { Context } from "../../src/runtime/context";

function setSearch(search: string): void {
    window.history.pushState({}, "", `/${search}`);
}

describe("Context", () => {
    afterEach(() => {
        Context.reset();
        setSearch("");
    });

    it("returns the same instance on repeated access", () => {
        expect(Context.Instance).toBe(Context.Instance);
    });

    it("wires a working logger without throwing", () => {
        expect(() => Context.Instance.logger.info("context.smoke_test")).not.toThrow();
    });

    it("returns a fresh instance after reset()", () => {
        const first = Context.Instance;
        Context.reset();

        expect(Context.Instance).not.toBe(first);
    });

    it("defaults debug to false with no query string", () => {
        expect(Context.Instance.debug).toBe(false);
    });

    it("sets debug from ?debug", () => {
        setSearch("?debug=1");

        expect(Context.Instance.debug).toBe(true);
    });
});

// End-to-end regression coverage for the precedence rule documented in CLAUDE.md's Log
// Categories section: an explicit ?logCategory= must win outright over ?debug's show-everything
// shorthand. Context always wires a real ConsoleTelemetrySink internally (not injectable), so
// the only reliable way to observe the actual filtering decision is to spy on console output.
describe("Context log category precedence (console-observed)", () => {
    afterEach(() => {
        Context.reset();
        setSearch("");
        vi.restoreAllMocks();
    });

    it("shows every category under bare ?debug", () => {
        setSearch("?debug=1");
        const spy = vi.spyOn(console, "info").mockImplementation(() => {});

        Context.Instance.logger.info("general.message", undefined, "general");
        Context.Instance.logger.info("other.message", undefined, "other");

        const logged = spy.mock.calls.map((call) => call[1]);
        expect(logged).toEqual(["general.message", "other.message"]);
    });

    it("restricts to the explicit allow-list even when ?debug is also set", () => {
        setSearch("?debug=1&logCategory=foo");
        const spy = vi.spyOn(console, "info").mockImplementation(() => {});

        Context.Instance.logger.info("foo.message", undefined, "foo");
        Context.Instance.logger.info("bar.message", undefined, "bar");

        const logged = spy.mock.calls.map((call) => call[1]);
        expect(logged).toEqual(["foo.message"]);
    });

    it("lets ?logCategoryExclude suppress a category even under bare ?debug", () => {
        setSearch("?debug=1&logCategoryExclude=noisy");
        const spy = vi.spyOn(console, "info").mockImplementation(() => {});

        Context.Instance.logger.info("kept.message", undefined, "kept");
        Context.Instance.logger.info("suppressed.message", undefined, "noisy");

        const logged = spy.mock.calls.map((call) => call[1]);
        expect(logged).toEqual(["kept.message"]);
    });
});
