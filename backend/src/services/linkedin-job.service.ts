import { assertPublicHttpUrl } from "../security/url-safety.js";
import type { AnalyzeJobPostInput } from "../schemas/job-post.schema.js";
import { JobPostAnalysis } from "../models/job-post-analysis.model.js";
import { analyzeJobRisk } from "./job-risk.service.js";

const MAX_HTML_CHARS = 1_000_000;
const FETCH_TIMEOUT_MS = 8_000;

type ExtractedJob = {
  title?: string;
  company?: string;
  description?: string;
  applicationUrl?: string;
};

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n: string) => String.fromCodePoint(Number.parseInt(n, 16)));
}

function clean(value: string | undefined): string | undefined {
  const result = value
    ? decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim()
    : "";
  return result ? result.slice(0, 30_000) : undefined;
}

function getAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const pattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  for (const match of tag.matchAll(pattern)) {
    const name = match[1]?.toLowerCase();
    if (name) attributes[name] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attributes;
}

function meta(html: string, key: string): string | undefined {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = getAttributes(match[0]);
    if ((attributes.property || attributes.name || "").toLowerCase() === key.toLowerCase()) {
      const value = clean(attributes.content);
      if (value) return value;
    }
  }
  return undefined;
}

function extractJobPostingJsonLd(html: string): ExtractedJob {
  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed: unknown = JSON.parse(match[1] || "");
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const candidate of candidates) {
        if (!candidate || typeof candidate !== "object") continue;
        const record = candidate as Record<string, unknown>;
        const graph = Array.isArray(record["@graph"]) ? record["@graph"] : [];
        for (const item of [record, ...graph]) {
          if (!item || typeof item !== "object") continue;
          const job = item as Record<string, unknown>;
          const type = job["@type"];
          if (!(type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting")))) continue;
          const organization = job.hiringOrganization && typeof job.hiringOrganization === "object"
            ? (job.hiringOrganization as Record<string, unknown>)
            : undefined;
          return {
            title: typeof job.title === "string" ? clean(job.title) : undefined,
            company: typeof organization?.name === "string" ? clean(organization.name) : undefined,
            description: typeof job.description === "string" ? clean(job.description) : undefined,
          };
        }
      }
    } catch {
      // Ignore malformed or non-job structured data and continue with public metadata.
    }
  }
  return {};
}

async function extractPublicLinkedInPage(url: string): Promise<ExtractedJob> {
  let current = new URL(url);
  const dnsCache = new Map<string, Promise<void>>();
  for (let redirect = 0; redirect <= 3; redirect += 1) {
    const host = current.hostname.toLowerCase().replace(/^www\./, "");
    if (host !== "linkedin.com") {
      throw new Error("LinkedIn redirected to a different domain; extraction was stopped for safety.");
    }
    await assertPublicHttpUrl(current.toString(), dnsCache);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(current, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "user-agent": "HireGuardJobChecker/1.0 (+public-page-check)",
          accept: "text/html,application/xhtml+xml",
        },
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
    if (!response.ok) {
      throw new Error("LinkedIn did not provide a public job page (HTTP " + response.status + "). Paste the job description to continue.");
    }

    const html = (await response.text()).slice(0, MAX_HTML_CHARS);
    const structured = extractJobPostingJsonLd(html);
    return {
      title: structured.title || meta(html, "og:title") || clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]),
      company: structured.company || meta(html, "job:company") || undefined,
      description: structured.description || meta(html, "og:description") || meta(html, "description"),
      applicationUrl: structured.applicationUrl || meta(html, "job:apply_url"),
    };
  }
  throw new Error("Unable to retrieve a public LinkedIn job page.");
}

export async function analyzeLinkedInJobPost(input: AnalyzeJobPostInput, userId: string) {
  let extracted: ExtractedJob = {};
  let extractionMessage: string | undefined;
  try {
    extracted = await extractPublicLinkedInPage(input.url);
  } catch (error) {
    extractionMessage = error instanceof Error ? error.message : "Public extraction was unavailable.";
  }

  const description = input.description || extracted.description || "";
  const jobTitle = extracted.title?.replace(/\s*\|\s*LinkedIn.*$/i, "").trim();
  const companyName = extracted.company;
  const extractionStatus = description || jobTitle || companyName
    ? (extractionMessage ? "PARTIAL" : "EXTRACTED")
    : "FAILED";
  const risk = analyzeJobRisk({
    description,
    applicationUrl: extracted.applicationUrl,
    companyName,
  });

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
