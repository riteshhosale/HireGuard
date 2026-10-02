import type { Page, Request, Response } from "playwright";
import type { NetworkEvent } from "./types.js";

export class NetworkMonitor {
  private readonly events: NetworkEvent[] = [];

  attach(page: Page): void {
    page.on("request", (request: Request) => {
      this.events.push({
        type: "REQUEST",
        timestamp: new Date().toISOString(),
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
      });
    });

    page.on("response", (response: Response) => {
      const request = response.request();

      this.events.push({
        type: "RESPONSE",
        timestamp: new Date().toISOString(),
        url: response.url(),
        method: request.method(),
        status: response.status(),
        resourceType: request.resourceType(),
      });
    });

    page.on("requestfinished", (request: Request) => {
      this.events.push({
        type: "REQUEST_FINISHED",
        timestamp: new Date().toISOString(),
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
      });
    });

    page.on("requestfailed", (request: Request) => {
      this.events.push({
        type: "REQUEST_FAILED",
        timestamp: new Date().toISOString(),
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        failure: request.failure()?.errorText,
      });
    });
  }

  getEvents(): NetworkEvent[] {
    return [...this.events];
  }
}