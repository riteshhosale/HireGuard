import {
  Event,
} from "../models/event.model.js";

import type {
  NetworkEvent,
  PageEvidence,
} from "../scanner/types.js";

export async function savePageEvidence(
  scanId: string,

  page: PageEvidence,
): Promise<void> {
  await Event.create({
    scanId,

    type: "PAGE_EVIDENCE",

    timestamp: new Date(),

    url: page.url,

    data: {
      title:
        page.title,

      text:
        page.text.slice(
          0,
          10_000,
        ),

      forms:
        page.forms,

      redirects:
        page.redirects,

      stopGuard:
        page.stopGuard,
    },
  });
}

export async function saveNetworkEvidence(
  scanId: string,

  events: NetworkEvent[],
): Promise<void> {
  if (
    events.length === 0
  ) {
    return;
  }

  await Event.insertMany(
    events.map(
      (event) => ({
        scanId,

        type:
          event.type,

        timestamp:
          new Date(
            event.timestamp,
          ),

        url:
          event.url,

        data: {
          method:
            event.method,

          status:
            event.status,

          resourceType:
            event.resourceType,

          failure:
            event.failure,
        },
      }),
    ),
  );
}