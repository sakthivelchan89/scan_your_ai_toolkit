import type { Rubric } from "../types.js";

export const JIRA_TICKET: Rubric = {
  name: "jira-ticket", description: "Score Jira ticket quality",
  dimensions: [
    { name: "Completeness", weight: 0.25, description: "All required fields filled", scoringCriteria: { excellent: "All fields present with detail", good: "Most fields present", fair: "Missing some fields", poor: "Missing critical fields" } },
    { name: "Clarity", weight: 0.25, description: "Clear and unambiguous language", scoringCriteria: { excellent: "Crystal clear, no ambiguity", good: "Mostly clear", fair: "Some ambiguity", poor: "Confusing or vague" } },
    { name: "Priority Accuracy", weight: 0.20, description: "Priority matches severity", scoringCriteria: { excellent: "Priority perfectly matched", good: "Reasonable priority", fair: "Slightly off", poor: "Mismatched priority" } },
    { name: "Acceptance Criteria", weight: 0.30, description: "Testable acceptance criteria", scoringCriteria: { excellent: "All criteria testable and specific", good: "Most criteria testable", fair: "Vague criteria", poor: "No acceptance criteria" } },
  ],
};

export const CODE_REVIEW: Rubric = {
  name: "code-review", description: "Score code review quality",
  dimensions: [
    { name: "Thoroughness", weight: 0.30, description: "Coverage of issues", scoringCriteria: { excellent: "All issues caught", good: "Most issues caught", fair: "Some missed", poor: "Major issues missed" } },
    { name: "Actionability", weight: 0.30, description: "Clear fix suggestions", scoringCriteria: { excellent: "Every issue has a fix", good: "Most have fixes", fair: "Some vague suggestions", poor: "No actionable feedback" } },
    { name: "Accuracy", weight: 0.25, description: "Correct assessments", scoringCriteria: { excellent: "All feedback correct", good: "Mostly correct", fair: "Some false positives", poor: "Many incorrect claims" } },
    { name: "Tone", weight: 0.15, description: "Constructive and professional", scoringCriteria: { excellent: "Encouraging and constructive", good: "Professional", fair: "Neutral", poor: "Harsh or dismissive" } },
  ],
};

export const EMAIL_DRAFT: Rubric = {
  name: "email-draft", description: "Score email draft quality",
  dimensions: [
    { name: "Tone", weight: 0.25, description: "Appropriate tone for context", scoringCriteria: { excellent: "Perfect tone", good: "Appropriate", fair: "Slightly off", poor: "Wrong tone" } },
    { name: "Completeness", weight: 0.25, description: "All points covered", scoringCriteria: { excellent: "All points addressed", good: "Most covered", fair: "Some missing", poor: "Major omissions" } },
    { name: "Relevance", weight: 0.25, description: "Stays on topic", scoringCriteria: { excellent: "Laser focused", good: "Mostly relevant", fair: "Some tangents", poor: "Off topic" } },
    { name: "Call to Action", weight: 0.25, description: "Clear next steps", scoringCriteria: { excellent: "Clear CTA with deadline", good: "CTA present", fair: "Vague CTA", poor: "No CTA" } },
  ],
};

export const SQL_QUERY: Rubric = {
  name: "sql-query", description: "Score SQL query quality",
  dimensions: [
    { name: "Correctness", weight: 0.35, description: "Produces correct results", scoringCriteria: { excellent: "Correct for all cases", good: "Correct for common cases", fair: "Partial correctness", poor: "Wrong results" } },
    { name: "Performance", weight: 0.25, description: "Efficient execution", scoringCriteria: { excellent: "Optimal query plan", good: "Reasonable performance", fair: "Could be optimized", poor: "Very inefficient" } },
    { name: "Safety", weight: 0.25, description: "No injection or data risk", scoringCriteria: { excellent: "Parameterized, safe", good: "Mostly safe", fair: "Minor risks", poor: "Injection vulnerable" } },
    { name: "Readability", weight: 0.15, description: "Well formatted and clear", scoringCriteria: { excellent: "Well formatted with comments", good: "Readable", fair: "Hard to follow", poor: "Unreadable" } },
  ],
};

export const DOCUMENTATION: Rubric = {
  name: "documentation", description: "Score documentation quality",
  dimensions: [
    { name: "Accuracy", weight: 0.30, description: "Technically correct", scoringCriteria: { excellent: "All facts correct", good: "Mostly accurate", fair: "Some errors", poor: "Major inaccuracies" } },
    { name: "Completeness", weight: 0.25, description: "All topics covered", scoringCriteria: { excellent: "Comprehensive", good: "Most covered", fair: "Gaps present", poor: "Very incomplete" } },
    { name: "Structure", weight: 0.25, description: "Well organized", scoringCriteria: { excellent: "Perfect hierarchy", good: "Good organization", fair: "Could be better", poor: "Disorganized" } },
    { name: "Readability", weight: 0.20, description: "Easy to understand", scoringCriteria: { excellent: "Crystal clear", good: "Readable", fair: "Dense", poor: "Incomprehensible" } },
  ],
};

export const SUMMARY: Rubric = {
  name: "summary", description: "Score summary quality",
  dimensions: [
    { name: "Faithfulness", weight: 0.30, description: "No hallucinated facts", scoringCriteria: { excellent: "Perfectly faithful", good: "Mostly faithful", fair: "Minor additions", poor: "Fabricated content" } },
    { name: "Coverage", weight: 0.25, description: "Key points included", scoringCriteria: { excellent: "All key points", good: "Most covered", fair: "Some missed", poor: "Major omissions" } },
    { name: "Conciseness", weight: 0.25, description: "No unnecessary detail", scoringCriteria: { excellent: "Perfectly concise", good: "Mostly concise", fair: "Some verbosity", poor: "Very verbose" } },
    { name: "Coherence", weight: 0.20, description: "Logical flow", scoringCriteria: { excellent: "Perfect flow", good: "Flows well", fair: "Somewhat choppy", poor: "Incoherent" } },
  ],
};
