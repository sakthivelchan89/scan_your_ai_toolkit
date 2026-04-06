import type { Rubric } from "../types.js";
import { JIRA_TICKET, CODE_REVIEW, EMAIL_DRAFT, SQL_QUERY, DOCUMENTATION, SUMMARY } from "./builtin.js";

const BUILTIN_RUBRICS: Record<string, Rubric> = {
  "jira-ticket": JIRA_TICKET, "code-review": CODE_REVIEW, "email-draft": EMAIL_DRAFT,
  "sql-query": SQL_QUERY, "documentation": DOCUMENTATION, "summary": SUMMARY,
};

export function getRubric(name: string): Rubric | undefined { return BUILTIN_RUBRICS[name]; }
export function listRubrics(): string[] { return Object.keys(BUILTIN_RUBRICS); }
export { BUILTIN_RUBRICS };
