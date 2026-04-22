import { describe, it, expect } from "vitest";
import { resolvePostConfig } from "../../src/core/config";

describe("resolvePostConfig", () => {
  it("returns gateway+apiKey from env when no flags", () => {
    const got = resolvePostConfig({ flags: {}, env: { MAIIFE_GATEWAY: "https://g", MAIIFE_API_KEY: "mk-abc" } });
    expect(got).toEqual({ gateway: "https://g", apiKey: "mk-abc" });
  });

  it("flag gateway overrides env", () => {
    const got = resolvePostConfig({ flags: { postTo: "https://flag" }, env: { MAIIFE_GATEWAY: "https://env", MAIIFE_API_KEY: "mk-a" } });
    expect(got.gateway).toBe("https://flag");
  });

  it("flag key overrides env", () => {
    const got = resolvePostConfig({ flags: { key: "mk-flag" }, env: { MAIIFE_GATEWAY: "https://g", MAIIFE_API_KEY: "mk-env" } });
    expect(got.apiKey).toBe("mk-flag");
  });

  it("returns undefined fields when nothing configured", () => {
    const got = resolvePostConfig({ flags: {}, env: {} });
    expect(got.gateway).toBeUndefined();
    expect(got.apiKey).toBeUndefined();
  });

  it("returns gateway without key (caller surfaces warning)", () => {
    const got = resolvePostConfig({ flags: {}, env: { MAIIFE_GATEWAY: "https://g" } });
    expect(got.gateway).toBe("https://g");
    expect(got.apiKey).toBeUndefined();
  });
});
