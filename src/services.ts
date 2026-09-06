// Global Logger singleton accessor. `runtime/context.ts`'s Context wires the real logger in
// via setLogger() at construction; always read it back through getLogger() (throws if called
// before Context is constructed) rather than holding a reference to the module-level variable.

import { AppError } from "./errors";
import type { Logger } from "./contracts";

let logger: Logger | undefined;

export function setLogger(value: Logger): void {
    logger = value;
}

export function resetLogger(): void {
    logger = undefined;
}

export function getLogger(): Logger {
    if (!logger) {
        throw new AppError("logger.not_initialized", "Logger not initialized");
    }

    return logger;
}
