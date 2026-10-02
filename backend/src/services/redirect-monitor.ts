import type { Page } from "playwright";
import type { RedirectEvent } from "./types.js";

export class RedirectMonitor {
  private readonly redirects: RedirectEvent[] = [];

  attach(page: Page): void {
    page.on("framenavigated", (frame) => {
      if (frame !== page.mainFrame()) {
        return;
      }

      const currentUrl = frame.url();

      if (!currentUrl) {
        return;
      }

      const previous = this.redirects.at(-1);

      if (previous?.to === currentUrl) {
        return;
      }

      this.redirects.push({
        from: previous?.to ?? "",
        to: currentUrl,
        timestamp: new Date().toISOString(),
      });
    });
  }

  getRedirects(): RedirectEvent[] {
    return [...this.redirects];
  }
}