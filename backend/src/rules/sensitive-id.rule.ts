import type { RuleContext } from "./rule-context.js";
import type { RuleFinding } from "./types.js";

const SENSITIVE_ID_KEYWORDS = [
  "passport",
  "passport number",
  "government id",
  "government identification",
  "national id",
  "aadhaar",
  "pan card",
  "social security number",
  "ssn",
  "driving license",
  "driver license",
];

export function detectSensitiveIdRequest(
  context: RuleContext,
): RuleFinding[] {
  const findings: RuleFinding[] = [];

  const pageText = context.page.text.toLowerCase();

  const matchedText = SENSITIVE_ID_KEYWORDS.find(
    (keyword) => pageText.includes(keyword),
  );

  const sensitiveFields = context.page.forms.flatMap(
    (form) =>
      form.fields.filter((field) => {
        const value =
          `${field.name} ${field.placeholder ?? ""}`
            .toLowerCase();

        return SENSITIVE_ID_KEYWORDS.some((keyword) =>
          value.includes(keyword),
        );
      }),
  );

  if (!matchedText && sensitiveFields.length === 0) {
    return findings;
  }

  findings.push({
    type: "SENSITIVE_ID_REQUEST",
    severity: "HIGH",
    score: 50,
    evidence:
      sensitiveFields.length > 0
        ? `Sensitive identification field detected: ${sensitiveFields[0]?.name}`
        : `Sensitive identification language detected: ${matchedText}`,
    source: "sensitive-id.rule",
  });

  return findings;
}