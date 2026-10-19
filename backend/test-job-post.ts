import assert from "node:assert/strict";
import { analyzeJobRisk } from "./src/services/job-risk.service.js";
import { analyzeJobPostSchema } from "./src/schemas/job-post.schema.js";
import { extractJobPostingJsonLd } from "./src/services/linkedin-job.service.js";

function hasFinding(result: ReturnType<typeof analyzeJobRisk>, code: string) {
  return result.findings.some((finding) => finding.code === code);
}

// Risk scoring: payment, sensitive information, urgency, and unrealistic earnings.
const suspicious = analyzeJobRisk({
  description: "Urgent hiring! Earn ₹1 lakh per month with no experience. Pay a registration fee before joining. Send your Aadhaar details and OTP on WhatsApp to confirm your position.",
});
assert.equal(suspicious.level, "CRITICAL");
assert.ok(suspicious.score >= 75 && suspicious.score <= 100);
assert.ok(hasFinding(suspicious, "PAYMENT_REQUEST"));
assert.ok(hasFinding(suspicious, "SENSITIVE_INFORMATION"));
assert.ok(hasFinding(suspicious, "URGENCY_PRESSURE"));
assert.ok(hasFinding(suspicious, "UNREALISTIC_OFFER"));
assert.ok(hasFinding(suspicious, "MISSING_COMPANY"));

// Company metadata absence is a caution signal, not a fraud verdict.
const ordinary = analyzeJobRisk({ description: "Software developer role. Apply with your resume.", companyName: "Example Ltd" });
assert.equal(ordinary.level, "LOW");
assert.equal(ordinary.score, 0);
assert.equal(hasFinding(ordinary, "MISSING_COMPANY"), false);

// Application destinations published in JSON-LD should reach risk scoring; the listing URL must not be mistaken for an apply URL.
const jsonLd = extractJobPostingJsonLd(`<script type="application/ld+json">{"@type":"JobPosting","title":"Engineer","url":"https://www.linkedin.com/jobs/view/123/","applicationUrl":"https://bit.ly/apply-now","hiringOrganization":{"name":"Example Ltd"},"description":"Apply today"}</script>`);
assert.equal(jsonLd.applicationUrl, "https://bit.ly/apply-now");
const listingOnly = extractJobPostingJsonLd(`<script type="application/ld+json">{"@type":"JobPosting","url":"https://www.linkedin.com/jobs/view/123/"}</script>`);
assert.equal(listingOnly.applicationUrl, undefined);
assert.ok(hasFinding(analyzeJobRisk({ applicationUrl: jsonLd.applicationUrl, companyName: jsonLd.company }), "SHORTENED_APPLICATION_LINK"));

// URL shorteners should be surfaced, and malformed URLs should not crash analysis.
const shortened = analyzeJobRisk({ applicationUrl: "https://bit.ly/example-job", companyName: "Example Ltd" });
assert.ok(hasFinding(shortened, "SHORTENED_APPLICATION_LINK"));
const malformed = analyzeJobRisk({ applicationUrl: "not a url", companyName: "Example Ltd" });
assert.ok(hasFinding(malformed, "INVALID_APPLICATION_LINK"));

// Only HTTPS LinkedIn job URLs are accepted; hostname lookalikes are rejected.
const validUrls = [
  "https://www.linkedin.com/jobs/view/123456789/",
  "https://linkedin.com/jobs/view/123456789",
];
for (const url of validUrls) {
  assert.equal(analyzeJobPostSchema.safeParse({ url, description: "" }).success, true, url);
}

const invalidUrls = [
  "http://www.linkedin.com/jobs/view/123456789/",
  "https://linkedin.com.evil.example/jobs/view/123456789/",
  "https://example.com/jobs/view/123456789/",
  "https://linkedin.com/company/example/",
  "javascript:alert(1)",
];
for (const url of invalidUrls) {
  assert.equal(analyzeJobPostSchema.safeParse({ url }).success, false, url);
}

assert.equal(
  analyzeJobPostSchema.safeParse({ url: "https://linkedin.com/jobs/view/123", description: "x".repeat(30001) }).success,
  false,
  "descriptions longer than 30,000 characters should be rejected",
);

console.log("Job-post regression tests passed.");
