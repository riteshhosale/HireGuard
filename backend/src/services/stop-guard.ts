import type { FormEvidence } from "./types.js";

export type StopReason =
  | "PASSWORD_FIELD"
  | "OTP_FIELD"
  | "PAYMENT_FIELD"
  | "BANK_INFORMATION"
  | "GOVERNMENT_ID"
  | "FINAL_APPLICATION"
  | "SENSITIVE_FORM";

export interface StopDecision {
  shouldStop: boolean;
  reason?: StopReason;
  evidence?: string;
}

const PASSWORD_KEYWORDS = [
  "password",
  "passwd",
  "passcode",
  "login password",
  "account password",
];

const OTP_KEYWORDS = [
  "otp",
  "one time password",
  "one-time password",
  "verification code",
  "security code",
  "verification otp",
];

const PAYMENT_KEYWORDS = [
  "card number",
  "credit card",
  "debit card",
  "card details",
  "cvv",
  "cvc",
  "expiry",
  "expiration",
  "expiration date",
  "upi",
  "payment",
  "payment details",
];

const BANK_KEYWORDS = [
  "bank account",
  "account number",
  "bank details",
  "bank information",
  "ifsc",
  "routing number",
  "swift code",
  "beneficiary account",
];

const GOVERNMENT_ID_KEYWORDS = [
  "aadhaar",
  "aadhar",
  "aadhaar number",
  "aadhar number",
  "pan number",
  "pan card",
  "passport number",
  "passport",
  "government id",
  "government identification",
  "government identity",
  "driving license",
  "driver license",
  "driving licence",
  "national id",
  "national identification",
  "social security number",
  "ssn",
];

const FINAL_APPLICATION_KEYWORDS = [
  "submit application",
  "submit application form",
  "final application",
  "complete application",
  "complete your application",
  "apply now",
  "submit your application",
  "finish application",
  "send application",
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function containsKeyword(
  value: string,
  keywords: string[],
): string | undefined {
  const normalized = normalize(value);

  return keywords.find((keyword) =>
    normalized.includes(keyword),
  );
}

function createDecision(
  reason: StopReason,
  evidence: string,
): StopDecision {
  return {
    shouldStop: true,
    reason,
    evidence,
  };
}

export function checkStopGuard(
  text: string,
): StopDecision {
  const normalizedText = normalize(text);

  const passwordKeyword = containsKeyword(
    normalizedText,
    PASSWORD_KEYWORDS,
  );

  if (passwordKeyword) {
    return createDecision(
      "PASSWORD_FIELD",
      `Password-related content detected: "${passwordKeyword}"`,
    );
  }

  const otpKeyword = containsKeyword(
    normalizedText,
    OTP_KEYWORDS,
  );

  if (otpKeyword) {
    return createDecision(
      "OTP_FIELD",
      `OTP/verification content detected: "${otpKeyword}"`,
    );
  }

  const paymentKeyword = containsKeyword(
    normalizedText,
    PAYMENT_KEYWORDS,
  );

  if (paymentKeyword) {
    return createDecision(
      "PAYMENT_FIELD",
      `Payment-related content detected: "${paymentKeyword}"`,
    );
  }

  const bankKeyword = containsKeyword(
    normalizedText,
    BANK_KEYWORDS,
  );

  if (bankKeyword) {
    return createDecision(
      "BANK_INFORMATION",
      `Bank-related content detected: "${bankKeyword}"`,
    );
  }

  const governmentIdKeyword = containsKeyword(
    normalizedText,
    GOVERNMENT_ID_KEYWORDS,
  );

  if (governmentIdKeyword) {
    return createDecision(
      "GOVERNMENT_ID",
      `Government ID-related content detected: "${governmentIdKeyword}"`,
    );
  }

  const finalApplicationKeyword = containsKeyword(
    normalizedText,
    FINAL_APPLICATION_KEYWORDS,
  );

  if (finalApplicationKeyword) {
    return createDecision(
      "FINAL_APPLICATION",
      `Final application action detected: "${finalApplicationKeyword}"`,
    );
  }

  return {
    shouldStop: false,
  };
}

export function checkFormStopGuard(
  forms: FormEvidence[],
): StopDecision {
  for (const form of forms) {
    for (const field of form.fields) {
      const fieldData = [
        field.name,
        field.type,
        field.placeholder ?? "",
        field.autocomplete ?? "",
      ].join(" ");

      const normalizedField = normalize(fieldData);

      const passwordKeyword = containsKeyword(
        normalizedField,
        PASSWORD_KEYWORDS,
      );

      if (
        passwordKeyword ||
        field.type.toLowerCase() === "password"
      ) {
        return createDecision(
          "PASSWORD_FIELD",
          `Sensitive password field detected: "${field.name}"`,
        );
      }

      const otpKeyword = containsKeyword(
        normalizedField,
        OTP_KEYWORDS,
      );

      if (otpKeyword) {
        return createDecision(
          "OTP_FIELD",
          `OTP/verification field detected: "${field.name}"`,
        );
      }

      const paymentKeyword = containsKeyword(
        normalizedField,
        PAYMENT_KEYWORDS,
      );

      if (paymentKeyword) {
        return createDecision(
          "PAYMENT_FIELD",
          `Payment field detected: "${field.name}"`,
        );
      }

      const bankKeyword = containsKeyword(
        normalizedField,
        BANK_KEYWORDS,
      );

      if (bankKeyword) {
        return createDecision(
          "BANK_INFORMATION",
          `Bank information field detected: "${field.name}"`,
        );
      }

      const governmentIdKeyword = containsKeyword(
        normalizedField,
        GOVERNMENT_ID_KEYWORDS,
      );

      if (governmentIdKeyword) {
        return createDecision(
          "GOVERNMENT_ID",
          `Government ID field detected: "${field.name}"`,
        );
      }
    }

    const formAction = normalize(form.action);

    const finalApplicationKeyword = containsKeyword(
      formAction,
      FINAL_APPLICATION_KEYWORDS,
    );

    if (finalApplicationKeyword) {
      return createDecision(
        "FINAL_APPLICATION",
        `Final application form detected: "${form.action}"`,
      );
    }
  }

  return {
    shouldStop: false,
  };
}

export function checkPageStopGuard(
  text: string,
  forms: FormEvidence[],
): StopDecision {
  const textDecision = checkStopGuard(text);

  if (textDecision.shouldStop) {
    return textDecision;
  }

  const formDecision = checkFormStopGuard(forms);

  if (formDecision.shouldStop) {
    return formDecision;
  }

  return {
    shouldStop: false,
  };
}