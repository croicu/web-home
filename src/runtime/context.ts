import { ConsoleTelemetrySink, DefaultLogger } from "../logging";
import { setLogger, resetLogger } from "../services";
import type { Logger } from "../contracts";

// The external-world boundary: environment flags, the URL query string, and process-lifetime
// services (starting with Logger) live here. Do NOT put application/UI state (selected item,
// current view, loaded data) into Context -- that belongs in a dedicated state/ layer once this
// project has one. See CLAUDE.md's Architecture conventions.
export class Context {
    private static s_instance?: Context;

    private readonly _debug: boolean;
    private readonly _logger: Logger;

    // Bound instance methods (not inline lambdas) so removeEventListener can find the exact
    // same reference addEventListener registered -- see removeGlobalErrorHandlers.
    private readonly _onWindowError = (event: ErrorEvent): void => {
        this._logger.fatal("window.uncaught_error", event.error ?? event.message);
    };

    private readonly _onUnhandledRejection = (event: PromiseRejectionEvent): void => {
        this._logger.fatal("window.unhandled_rejection", event.reason);
    };

    public static get Instance(): Context {
        if (!Context.s_instance) {
            Context.s_instance = new Context();
        }

        return Context.s_instance;
    }

    // Tears down the outgoing instance's global listeners before discarding it -- tests
    // construct a fresh Context per test (tests/setup.ts) while happy-dom's `window` is shared
    // for the whole test file, so skipping this would leak a listener pair per test.
    public static reset(): void {
        if (Context.s_instance) {
            Context.s_instance.removeGlobalErrorHandlers();
        }

        Context.s_instance = undefined;
        resetLogger();
    }

    private constructor() {
        const params = new URLSearchParams(window.location.search);

        this._debug = this.hasValue(params, "debug");

        const logCategories = this.parseCommaList(params, "logCategory");
        // An explicit ?logCategory= wins outright over ?debug=1's "show everything" shorthand --
        // showAllCategories only kicks in when no explicit allow-list was given, so
        // ?debug=1&logCategory=foo shows only ["foo"], not every category.
        const showAllCategories = this._debug && logCategories === null;
        const logCategoryExclude = this.parseCommaList(params, "logCategoryExclude");

        this._logger = new DefaultLogger(new ConsoleTelemetrySink(), logCategories, showAllCategories, logCategoryExclude);
        setLogger(this._logger);

        this.addGlobalErrorHandlers();
    }

    public get debug(): boolean {
        return this._debug;
    }

    public get logger(): Logger {
        return this._logger;
    }

    private addGlobalErrorHandlers(): void {
        window.addEventListener("error", this._onWindowError);
        window.addEventListener("unhandledrejection", this._onUnhandledRejection);
    }

    private removeGlobalErrorHandlers(): void {
        window.removeEventListener("error", this._onWindowError);
        window.removeEventListener("unhandledrejection", this._onUnhandledRejection);
    }

    private hasValue(params: URLSearchParams, name: string): boolean {
        const value = params.get(name);

        return value !== null && value !== "";
    }

    private parseCommaList(params: URLSearchParams, name: string): string[] | null {
        const raw = params.get(name);
        if (!raw) {
            return null;
        }

        const values = raw
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v.length > 0);

        return values.length > 0 ? values : null;
    }
}
