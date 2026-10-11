import type { JobRiskLevel } from "../models/job-post-analysis.model.js";

export interface JobRiskFinding {
  code: string;
  title: string;
  description: string;
  severity: JobRiskLevel;
  points: number;
}

export function analyzeJobRisk(input: {
  description?: string;
  applicationUrl?: string;
  companyName?: string;
}) {
  const text = (input.description || "").toLowerCase();
  const findings: JobRiskFinding[] = [];
  const add = (code: string, title: string, description: string, severity: JobRiskLevel, points: number) => {
    findings.push({ code, title, description, severity, points });
  };
  const includesAny = (terms: string[]) => terms.some((term) => text.includes(term));

  if (includesAny(["registration fee", "processing fee", "security deposit", "joining fee", "training fee", "pay to apply", "payment required", "send money"])) {
    add("PAYMENT_REQUEST", "Payment requested", "The provided text mentions a fee, deposit, or payment connected to the job. Legitimate employers generally do not charge applicants to get hired.", "CRITICAL", 35);
  }
  if (includesAny(["whatsapp only", "telegram only", "message me on telegram", "contact us on whatsapp", "contact on whatsapp"])) {
    add("MESSAGING_APP_ONLY", "Messaging-app-only contact", "The post appears to direct applicants to WhatsApp or Telegram instead of a verifiable hiring channel.", "HIGH", 15);
  }
  if (includesAny(["send your aadhaar", "send aadhaar", "pan card photo", "bank details", "bank account number", "credit card", "debit card", "share your otp", "send otp", "your password"])) {
    add("SENSITIVE_INFORMATION", "Sensitive information requested", "The text appears to request identity, financial, or authentication information. Do not share OTPs, passwords, or banking credentials.", "CRITICAL", 25);
  }
  if (includesAny(["urgent hiring", "join immediately", "apply immediately", "limited seats", "act now", "hurry"])) {
    add("URGENCY_PRESSURE", "Pressure to act quickly", "The post uses urgency language. This is a warning sign when combined with requests for money or personal information.", "MEDIUM", 10);
  }
  if (includesAny(["earn ₹1 lakh", "earn rs 1 lakh", "earn 100000", "₹1,00,000 per month", "100000 per month", "earn daily without experience", "work 1 hour"])) {
    add("UNREALISTIC_OFFER", "Potentially unrealistic earnings", "The text makes a high-earnings claim with limited requirements. Verify compensation and responsibilities independently.", "HIGH", 15);
  }
  if (!input.companyName?.trim()) {
    add("MISSING_COMPANY", "Company could not be verified from the provided details", "No clear company name was extracted. This may be due to LinkedIn limiting public access; it is not proof of fraud.", "LOW", 5);
  }
  if (input.applicationUrl) {
    try {
      const host = new URL(input.applicationUrl).hostname.toLowerCase();
      const shorteners = ["bit.ly", "tinyurl.com", "t.me", "wa.me", "cutt.ly", "rb.gy"];
      if (shorteners.some((domain) => host === domain || host.endsWith("." + domain))) {
        add("SHORTENED_APPLICATION_LINK", "Shortened or messaging application link", "The application link uses a URL shortener or messaging service, so the final destination should be verified before opening.", "HIGH", 15);
      }
    } catch {
      add("INVALID_APPLICATION_LINK", "Application link could not be parsed", "The supplied application link is not a valid URL.", "MEDIUM", 10);
    }
  }

  const score = Math.min(100, findings.reduce((sum, finding) => sum + finding.points, 0));
  const level: JobRiskLevel = score >= 75 ? "CRITICAL" : score >= 50 ? "HIGH" : score >= 25 ? "MEDIUM" : "LOW";
  return { score, level, findings };
}
