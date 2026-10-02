import { chromium, type Browser } from "playwright";

import type {
  NetworkEvent,
  RedirectEvent,
  PageEvidence,
  ScanEvidence,
} from "./types.js";

import { collectDomEvidence } from "./dom-monitor.js";

import {
  checkPageStopGuard,
} from "./stop-guard.js";

import {
  assertPublicHttpUrl,
} from "../security/url-safety.js";

const PAGE_TIMEOUT = 20_000;

const POST_LOAD_WAIT = 250;

const MAX_NETWORK_EVENTS = 5_000;

const MAX_CONCURRENT_SCANS = 3;

const SKIPPED_RESOURCE_TYPES = new Set([
  "image",
  "font",
  "media",
]);

let sharedBrowser: Browser | undefined;
let browserLaunch: Promise<Browser> | undefined;
let activeScans = 0;
const scanWaiters: Array<() => void> = [];

async function getBrowser(): Promise<Browser> {
  if (sharedBrowser?.isConnected()) {
    return sharedBrowser;
  }

  if (!browserLaunch) {
    browserLaunch = chromium
      .launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--no-first-run",
          "--no-default-browser-check",
        ],
      })
      .then((browser) => {
        sharedBrowser = browser;
        return browser;
      })
      .finally(() => {
        browserLaunch = undefined;
      });
  }

  return browserLaunch;
}

async function acquireScanSlot(): Promise<void> {
  if (activeScans < MAX_CONCURRENT_SCANS) {
    activeScans += 1;
    return;
  }

  await new Promise<void>((resolve) => {
    scanWaiters.push(resolve);
  });

  activeScans += 1;
}

function releaseScanSlot(): void {
  activeScans -= 1;
  scanWaiters.shift()?.();
}

export async function scanUrl(
  initialUrl: string,
): Promise<ScanEvidence> {
  const checkedHosts =
    new Map<string, Promise<void>>();

  await assertPublicHttpUrl(
    initialUrl,
    checkedHosts,
  );

  const browser = await getBrowser();

  const context =
    await browser.newContext({
      serviceWorkers: "block",
    });

  const page =
    await context.newPage();

  await page.route(
    "**/*",
    async (route) => {
      const requestUrl =
        route.request().url();

      if (
        requestUrl.startsWith("http://") ||
        requestUrl.startsWith("https://")
      ) {
        try {
          await assertPublicHttpUrl(
            requestUrl,
            checkedHosts,
          );
        } catch {
          await route.abort(
            "blockedbyclient",
          );
          return;
        }
      }

      if (
        SKIPPED_RESOURCE_TYPES.has(
          route.request().resourceType(),
        )
      ) {
        await route.abort("blockedbyclient");
        return;
      }

      await route.continue();
    },
  );

  page.setDefaultTimeout(
    PAGE_TIMEOUT,
  );

  page.setDefaultNavigationTimeout(
    PAGE_TIMEOUT,
  );

  const network:
    NetworkEvent[] = [];

  const redirects:
    RedirectEvent[] = [];

  let previousUrl = "";

  const addNetworkEvent = (
    event: NetworkEvent,
  ): void => {
    if (
      network.length >=
      MAX_NETWORK_EVENTS
    ) {
      return;
    }

    network.push(event);
  };

  page.on(
    "request",
    (request) => {
      addNetworkEvent({
        type: "REQUEST",

        timestamp:
          new Date().toISOString(),

        url:
          request.url(),

        method:
          request.method(),

        resourceType:
          request.resourceType(),
      });
    },
  );

  page.on(
    "response",
    (response) => {
      addNetworkEvent({
        type: "RESPONSE",

        timestamp:
          new Date().toISOString(),

        url:
          response.url(),

        method:
          response.request().method(),

        status:
          response.status(),

        resourceType:
          response.request().resourceType(),
      });
    },
  );

  page.on(
    "requestfailed",
    (request) => {
      addNetworkEvent({
        type:
          "REQUEST_FAILED",

        timestamp:
          new Date().toISOString(),

        url:
          request.url(),

        method:
          request.method(),

        resourceType:
          request.resourceType(),

        failure:
          request.failure()
            ?.errorText ??
          "Unknown request failure",
      });
    },
  );

  page.on(
    "framenavigated",
    (frame) => {
      if (
        frame !==
        page.mainFrame()
      ) {
        return;
      }

      const currentUrl =
        frame.url();

      if (
        previousUrl &&
        currentUrl &&
        previousUrl !==
          currentUrl
      ) {
        redirects.push({
          from:
            previousUrl,

          to:
            currentUrl,

          timestamp:
            new Date().toISOString(),
        });
      }

      previousUrl =
        currentUrl;
    },
  );

  await acquireScanSlot();

  try {
    await page.goto(
      initialUrl,
      {
        waitUntil:
          "domcontentloaded",

        timeout:
          PAGE_TIMEOUT,
      },
    );

    await page.waitForTimeout(
      POST_LOAD_WAIT,
    );

    const domEvidence =
      await collectDomEvidence(
        page,
      );

    const stopDecision =
      checkPageStopGuard(
        domEvidence.text,
        domEvidence.forms,
      );

    const pageEvidence:
      PageEvidence = {
        url:
          page.url(),

        title:
          domEvidence.title,

        text:
          domEvidence.text,

        forms:
          domEvidence.forms,

        network,

        redirects,

        stopGuard: {
          triggered:
            stopDecision.shouldStop,

          reason:
            stopDecision.reason,

          evidence:
            stopDecision.evidence,
        },
      };

    return {
      initialUrl,

      finalUrl:
        page.url(),

      pages: [
        pageEvidence,
      ],
    };
  } finally {
    try {
      await page.close();
    } catch {
    }

    try {
      await context.close();
    } catch {
    }

    releaseScanSlot();
  }
}