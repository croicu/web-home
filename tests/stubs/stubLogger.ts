import type { Logger } from "../../src/contracts";

export class StubLogger implements Logger {
    public readonly diagnosticCalls: Array<{ message: string; props?: Record<string, unknown>; category?: string }> = [];
    public readonly infoCalls: Array<{ message: string; props?: Record<string, unknown>; category?: string }> = [];
    public readonly warningCalls: Array<{ message: string; props?: Record<string, unknown>; category?: string }> = [];
    public readonly errorCalls: Array<{ message: string; error?: unknown; props?: Record<string, unknown>; category?: string }> = [];
    public readonly fatalCalls: Array<{ message: string; error?: unknown; props?: Record<string, unknown>; category?: string }> = [];

    diagnostic(message: string, props?: Record<string, unknown>, category?: string): void {
        this.diagnosticCalls.push({ message, props, category });
    }

    info(message: string, props?: Record<string, unknown>, category?: string): void {
        this.infoCalls.push({ message, props, category });
    }

    warning(message: string, props?: Record<string, unknown>, category?: string): void {
        this.warningCalls.push({ message, props, category });
    }

    error(message: string, error?: unknown, props?: Record<string, unknown>, category?: string): void {
        this.errorCalls.push({ message, error, props, category });
    }

    fatal(message: string, error?: unknown, props?: Record<string, unknown>, category?: string): void {
        this.fatalCalls.push({ message, error, props, category });
    }
}
