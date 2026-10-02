import {
  Event,
} from "../models/event.model.js";

import type {
  NetworkEvent,
} from "../scanner/types.js";

export async function saveNetworkEvents(
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