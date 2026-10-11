import { assertPublicHttpUrl } from "../security/url-safety.js";
import type { AnalyzeJobPostInput } from "../schemas/job-post.schema.js";
import { JobPostAnalysis } from "../models/job-post-analysis.model.js";
import { analyzeJobRisk } from "./job-risk.service.js";

const MAX_HTML_CHARS = 1_000_000;
const FETCH_TIMEOUT_MS = 8_000;

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n: string) => String.fromCodePoint(Number.parseInt(n, 16)));
}

function clean(value: string | undefined): string | undefined {
  const result = value ? decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim() : "";
  return result ? result.slice(0, 30_000) : undefined;
}

function meta(html: string, key: string): string | undefined {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp('<meta[^>]+(?:property|name)=["\\']' + escaped + '["\\'][^>]+content=["\\']([^"\\']*)["\\'][^>]*>', "i"),
    new RegExp('<meta[^>]+content=["\\']([^"\\']*)["\\'][^>]+(?:property|name)=["\\']' + escaped + '["\\'][^>]*>', "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return clean(match[1]);
  }
  return undefined;
}

async function extractPublicLinkedInPage(url: string): Promise<{ title?: string; company?: string; description?: string; applicationUrl?: string }> {
  let current = new URL(url);
  const dnsCache = new Map<string, Promise<void>>();
  for (let redirect = 0; redirect <= 3; redirect += 1) {
    const host = current.hostname.toLowerCase().replace(/^www\./, "");
    if (host !== "linkedin.com") throw new Error("LinkedIn redirected to a different domain; extraction was stopped for safety.");
    await assertPublicHttpUrl(current.toString(), dnsCache);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(current, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { "user-agent": "HireGuardJobChecker/1.0 (+public-page-check)", accept: "text/html,application/xhtml+xml" },
      });
    } finally {
      clearTimeout(timer);
    }
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location || redirect === 3) throw new Error("LinkedIn redirected too many times.");
      current = new URL(location, current);
      continue;
    }
    if (!response.ok) throw new Error("LinkedIn did not provide a public job page (HTTP " + response.status + "). Paste the job description to continue.");
    const html = (await response.text()).slice(0, MAX_HTML_CHARS);
    const title = meta(html, "og:title") || clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
    const description = meta(html, "og:description") || meta(html, "description");
    const company = meta(html, "og:site_name");
    const applicationUrl = meta(html, "job:apply_url");
    return { title, company, description, applicationUrl };
  }
  throw new Error("Unable to retrieve a public LinkedIn job page.");
}

export async function analyzeLinkedInJobPost(input: AnalyzeJobPostInput, userId: string) {
  let extracted: { title?: string; company?: string; description?: string; applicationUrl?: string } = {};
  let extractionMessage: string | undefined;
  try {
    extracted = await extractPublicLinkedInPage(input.url);
  } catch (error) {
    extractionMessage = error instanceof Error ? error.message : "Public extraction was unavailable.";
  }

  const description = input.description || extracted.description || "";
  const jobTitle = extracted.title?.replace(/\s*\|\s*LinkedIn.*$/i, "").trim();
  const companyName = extracted.company;
  const extractionStatus = description || jobTitle || companyName ? (extractionMessage ? "PARTIAL" : "EXTRACTED") : "FAILED";
  const risk = analyzeJobRisk({ description, applicationUrl: extracted.applicationUrl, companyName });
  if (!description.trim() && !extractionMessage) {
    extractionMessage = "Only limited public metadata was available. Paste the complete job description for a more useful assessment.";
  }
  const record = await JobPostAnalysis.create({
    userId,
    sourceUrl: input.url,
    jobTitle,
    companyName,
    description: description || undefined,
    applicationUrl: extracted.applicationUrl,
    riskScore: risk.score,
    riskLevel: risk.level,
    findings: risk.findings,
    extractionStatus,
    extractionMessage,
    analyzedAt: new Date(),
  });
  return record.toObject();
}

export async function getJobPostAnalyses(userId: string) {
  return JobPostAnalysis.find({ userId }).sort({ analyzedAt: -1 }).limit(50).lean();
}
