/**
 * Runtime behavioral interfaces -- TypeScript `interface`s describing behavior (services,
 * sinks, ports this project's own internals depend on), not data. Persisted or shared data
 * contracts belong in protocols.ts instead. See CLAUDE.md's Architecture conventions.
 */

export type LogLevel = "diagnostic" | "info" | "warning" | "error" | "fatal";

export interface TelemetryRecord {
    timestamp: string;
    level: LogLevel;
    category: string;
    message: string;
    props?: Record<string, unknown>;
    error?: unknown;
}

export interface TelemetrySink {
    write(record: TelemetryRecord): void;
}

export interface Logger {
    diagnostic(message: string, props?: Record<string, unknown>, category?: string): void;
    info(message: string, props?: Record<string, unknown>, category?: string): void;
    warning(message: string, props?: Record<string, unknown>, category?: string): void;
    error(message: string, error?: unknown, props?: Record<string, unknown>, category?: string): void;
    fatal(message: string, error?: unknown, props?: Record<string, unknown>, category?: string): void;
}
