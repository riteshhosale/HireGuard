import {
  Schema,
  model,
  type InferSchemaType,
} from "mongoose";

const eventSchema = new Schema(
  {
    scanId: {
      type: String,
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
    },

    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },

    url: {
      type: String,
      required: true,
    },

    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

export type EventDocument =
  InferSchemaType<typeof eventSchema>;

export const Event = model(
  "Event",
  eventSchema,
);

export const ScanEvent = Event;