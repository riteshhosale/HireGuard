import type { RuleContext } from "./rule-context.js";
import type { RuleFinding } from "./types.js";

const PAYMENT_KEYWORDS = [
  "registration fee",
  "application fee",
  "processing fee",
  "joining fee",
  "security deposit",
  "payment required",
  "pay now",
  "pay to apply",
  "credit card",
  "debit card",
  "bank transfer",
  "upi payment",
];

export function detectPaymentRequest(
  context: RuleContext,
): RuleFinding[] {
  const findings: RuleFinding[] = [];

  const pageText = context.page.text.toLowerCase();

  const matched = PAYMENT_KEYWORDS.filter((keyword) =>
    pageText.includes(keyword),
  );

  const paymentFields = context.page.forms.flatMap(
    (form) =>
      form.fields.filter((field) => {
        const value = `${field.name} ${field.placeholder ?? ""}`
          .toLowerCase();

        return (
          value.includes("payment") ||
          value.includes("fee") ||
          value.includes("card")
        );
      }),
  );

  if (matched.length === 0 && paymentFields.length === 0) {
    return findings;
  }

  findings.push({
    type: "PAYMENT_REQUEST",
    severity: "HIGH",
    score: 50,
    evidence:
      paymentFields.length > 0
        ? `Payment-related form field detected: ${paymentFields[0]?.name}`
        : `Payment-related language detected: ${matched[0]}`,
    source: "payment.rule",
  });

  return findings;
}