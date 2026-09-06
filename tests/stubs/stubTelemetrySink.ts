import type { TelemetryRecord, TelemetrySink } from "../../src/contracts";

export class StubTelemetrySink implements TelemetrySink {
    public readonly records: TelemetryRecord[] = [];

    write(record: TelemetryRecord): void {
        this.records.push(record);
    }
}
