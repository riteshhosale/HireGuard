export type RuleType =
  | "PAYMENT_REQUEST"
  | "SENSITIVE_ID_REQUEST"
  | "CREDENTIAL_REQUEST"
  | "SUSPICIOUS_REDIRECT"
  | "URGENCY_LANGUAGE";

export type RuleSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface RuleFinding {
  type: RuleType;
  severity: RuleSeverity;
  score: number;
  evidence: string;
  source: string;
}
