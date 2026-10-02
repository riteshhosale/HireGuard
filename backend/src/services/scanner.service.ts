import { scanUrl } from "./playwright.js";
import type { ScanEvidence } from "./types.js";

export async function runWebsiteScan(
  jobUrl: string,
): Promise<ScanEvidence> {
  return scanUrl(jobUrl);
}