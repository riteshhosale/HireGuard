import type { RuleContext } from "./rule-context.js";
import type { RuleFinding } from "./types.js";

const CREDENTIAL_KEYWORDS = [
  "password",
  "login password",
  "account password",
  "username and password",
  "email password",
  "otp",
  "one time password",
];

export function detectCredentialRequest(
  context: RuleContext,
): RuleFinding[] {
  const findings: RuleFinding[] = [];

  const pageText = context.page.text.toLowerCase();

  const matchedText = CREDENTIAL_KEYWORDS.find(
    (keyword) => pageText.includes(keyword),
  );

  const credentialFields = context.page.forms.flatMap(
    (form) =>
      form.fields.filter((field) => {
        const value =
          `${field.name} ${field.placeholder ?? ""}`.toLowerCase();

        return (
          field.type === "password" ||
          CREDENTIAL_KEYWORDS.some((keyword) =>
            value.includes(keyword),
          )
        );
      }),
  );

  if (!matchedText && credentialFields.length === 0) {
    return findings;
  }

  findings.push({
    type: "CREDENTIAL_REQUEST",
    severity: "HIGH",

    // Credential request = 25 points
    score: 25,

    evidence:
      credentialFields.length > 0
        ? `Credential field detected: ${credentialFields[0]?.name}`
        : `Credential-related language detected: ${matchedText}`,

    source: "credential.rule",
  });

  return findings;
}