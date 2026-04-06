import type { MaiifeTelemetry } from "../types.js";
export function formatJSON(data: MaiifeTelemetry): string {
  return JSON.stringify(data, null, 2);
}
