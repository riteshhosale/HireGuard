import type { RuleContext } from "./rule-context.js";
import type { RuleFinding } from "./types.js";

function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function detectSuspiciousRedirect(
  context: RuleContext,
): RuleFinding[] {
  const findings: RuleFinding[] = [];

  const initialHost = getHostname(
    context.page.url,
  );

  if (!initialHost) {
    return findings;
  }

  for (const redirect of context.page.redirects) {
    const destinationHost = getHostname(
      redirect.to,
    );

    if (
      destinationHost &&
      destinationHost !== initialHost
    ) {
      findings.push({
        type: "SUSPICIOUS_REDIRECT",
        severity: "MEDIUM",
        score: 25,
        evidence:
          `Navigation moved from ${initialHost} ` +
          `to ${destinationHost}`,
        source: "redirect.rule",
      });
    }
  }

  return findings;
}