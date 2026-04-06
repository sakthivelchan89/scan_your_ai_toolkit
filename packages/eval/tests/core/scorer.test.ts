import { describe, it, expect } from "vitest";
import { evalScore } from "../../src/core/scorer.js";
import { getRubric } from "../../src/core/rubrics/index.js";

describe("evalScore", () => {
  it("scores a good jira ticket highly with heuristic judge", async () => {
    const rubric = getRubric("jira-ticket")!;
    const result = await evalScore({
      output: `## Bug: Login button unresponsive on mobile
**Priority:** High
**Assignee:** Frontend team

**Description:**
The login button on the mobile web app does not respond to taps on iOS Safari. Users must refresh the page to log in.

**Steps to Reproduce:**
1. Open app on iPhone Safari
2. Enter credentials
3. Tap Login button — nothing happens

**Acceptance Criteria:**
- [ ] Login button responds to tap within 200ms on iOS Safari
- [ ] Works on iOS 16+ and Android Chrome 120+
- [ ] No regression on desktop browsers`,
      rubric,
    });
    expect(result.totalScore).toBeGreaterThan(60);
    expect(result.scores.length).toBe(4);
    expect(result.rubric).toBe("jira-ticket");
    expect(result.grade).toMatch(/^[ABC]$/);
  });

  it("scores a poor jira ticket low", async () => {
    const rubric = getRubric("jira-ticket")!;
    const result = await evalScore({ output: "login broken pls fix", rubric });
    expect(result.totalScore).toBeLessThan(40);
    expect(result.grade).toMatch(/^[DF]$/);
  });

  it("works with custom judge function", async () => {
    const rubric = getRubric("jira-ticket")!;
    const result = await evalScore({
      output: "any output", rubric,
      judge: async ({ rubric }) => rubric.dimensions.map((d) => ({ dimension: d.name, score: 90, reasoning: "Custom judge says great" })),
    });
    expect(result.totalScore).toBe(90);
  });
});
