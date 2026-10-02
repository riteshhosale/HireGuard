import type { PageEvidence } from "../services/types.js";

import { detectPaymentRequest } from "./payment.rule.js";
import { detectSensitiveIdRequest } from "./sensitive-id.rule.js";
import { detectCredentialRequest } from "./credential.rule.js";
import { detectSuspiciousRedirect } from "./redirect.rule.js";
import { detectUrgencyLanguage } from "./urgency.rule.js";

import type { RuleFinding } from "./types.js";

export function analyzeRules(
  page: PageEvidence,
): RuleFinding[] {
  const context = { page };

  return [
    ...detectPaymentRequest(context),
    ...detectSensitiveIdRequest(context),
    ...detectCredentialRequest(context),
    ...detectSuspiciousRedirect(context),
    ...detectUrgencyLanguage(context),
  ];
}