import { Schema, model, type InferSchemaType } from "mongoose";

const findingSchema = new Schema(
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

    severity: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    evidence: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export type FindingDocument =
  InferSchemaType<typeof findingSchema>;

export const Finding = model<FindingDocument>(
  "Finding",
  findingSchema,
);