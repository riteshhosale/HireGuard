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
const MAX_QUEUED_SCANS = 12;

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

  if (scanWaiters.length >= MAX_QUEUED_SCANS) {
    throw new Error("Scanner is busy. Please retry in a short while.");
  }

  // The releasing scan transfers its reserved slot to this waiter.
  // Do not increment activeScans here: the reservation remains held.
  await new Promise<void>((resolve) => {
    scanWaiters.push(resolve);
  });
}

function releaseScanSlot(): void {
  const nextWaiter = scanWaiters.shift();

  if (nextWaiter) {
    // Hand off the existing slot atomically so a new request cannot jump the
    // queue between decrementing the count and waking the next waiter.
    nextWaiter();
    return;
  }

  activeScans -= 1;
}

export async function scanUrl(
  initialUrl: string,
): Promise<ScanEvidence> {
  await assertPublicHttpUrl(initialUrl);

  // Reserve capacity before allocating browser resources. The slot is released
  // even if browser launch, context/page setup, routing, or navigation fails.
  await acquireScanSlot();

  let context: import("playwright").BrowserContext | undefined;
  let page: import("playwright").Page | undefined;

  try {
    const browser = await getBrowser();
    const scanContext = await browser.newContext({
      serviceWorkers: "block",
    });
    context = scanContext;

    const scanPage = await scanContext.newPage();
    page = scanPage;

  await scanPage.route(
    "**/*",
    async (route) => {
      const requestUrl =
        route.request().url();

      if (
        SKIPPED_RESOURCE_TYPES.has(
          route.request().resourceType(),
        )
      ) {
        await route.abort("blockedbyclient");
        return;
      }

      if (
        requestUrl.startsWith("http://") ||
        requestUrl.startsWith("https://")
      ) {
        try {
          // Resolve every navigated/requested URL independently. Reusing a
          // hostname-only DNS cache can hide a changed private DNS answer.
          await assertPublicHttpUrl(requestUrl);
        } catch {
          await route.abort("blockedbyclient");
          return;
        }
      }

      await route.continue();
    },
  );

  scanPage.setDefaultTimeout(
    PAGE_TIMEOUT,
  );

  scanPage.setDefaultNavigationTimeout(
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

  scanPage.on(
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

  scanPage.on(
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

  scanPage.on(
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

  scanPage.on(
    "framenavigated",
    (frame) => {
      if (
        frame !==
        scanPage.mainFrame()
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

    await scanPage.goto(
      initialUrl,
      {
        waitUntil:
          "domcontentloaded",

        timeout:
          PAGE_TIMEOUT,
      },
    );

    await scanPage.waitForTimeout(
      POST_LOAD_WAIT,
    );

    const domEvidence =
      await collectDomEvidence(
        scanPage,
      );

    const stopDecision =
      checkPageStopGuard(
        domEvidence.text,
        domEvidence.forms,
      );

    const pageEvidence:
      PageEvidence = {
        url:
          scanPage.url(),

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
        scanPage.url(),

      pages: [
        pageEvidence,
      ],
    };
  } finally {
    try {
      await page?.close();
    } catch {
      // Cleanup must not hide the scan's original error.
    }

    try {
      await context?.close();
    } catch {
      // Cleanup must not hide the scan's original error.
    }

    releaseScanSlot();
  }
}