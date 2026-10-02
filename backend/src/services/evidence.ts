import type { Page } from "playwright";
import { NetworkMonitor } from "./network-monitor.js";
import { RedirectMonitor } from "./redirect-monitor.js";
import { collectDomEvidence } from "./dom-monitor.js";
import { checkPageStopGuard } from "./stop-guard.js";
import type { PageEvidence } from "./types.js";

export async function collectPageEvidence(
  page: Page,
): Promise<PageEvidence> {
  const networkMonitor = new NetworkMonitor();
  const redirectMonitor = new RedirectMonitor();

  networkMonitor.attach(page);
  redirectMonitor.attach(page);

  const dom = await collectDomEvidence(page);
  const stopDecision = checkPageStopGuard(
    dom.text,
    dom.forms,
  );

  return {
    url: page.url(),
    title: dom.title,
    text: dom.text,
    forms: dom.forms,
    network: networkMonitor.getEvents(),
    redirects: redirectMonitor.getRedirects(),
    stopGuard: {
      triggered: stopDecision.shouldStop,
      reason: stopDecision.reason,
      evidence: stopDecision.evidence,
    },
  };
}