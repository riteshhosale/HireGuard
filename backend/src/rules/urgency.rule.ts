import type { RuleContext } from "./rule-context.js";
import type { RuleFinding } from "./types.js";

const URGENCY_KEYWORDS = [
  "act now",
  "apply immediately",
  "limited time",
  "urgent",
  "immediately",
  "last chance",
  "respond today",
  "within 24 hours",
  "don't miss",
];

export function detectUrgencyLanguage(
  context: RuleContext,
): RuleFinding[] {
  const findings: RuleFinding[] = [];

  const text = context.page.text.toLowerCase();

  const matched = URGENCY_KEYWORDS.filter(
    (keyword) => text.includes(keyword),
  );

  if (matched.length === 0) {
    return findings;
  }

  findings.push({
    type: "URGENCY_LANGUAGE",
    severity: "LOW",
    score: 10,
    evidence:
      `Urgency language detected: ${matched
        .slice(0, 3)
        .join(", ")}`,
    source: "urgency.rule",
  });

  return findings;
}