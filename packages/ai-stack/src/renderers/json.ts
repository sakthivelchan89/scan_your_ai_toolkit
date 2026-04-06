import type { AIStackProfile } from "../core/types.js";

export function renderJSON(profile: AIStackProfile): string {
  return JSON.stringify(profile, null, 2);
}
