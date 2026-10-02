import {
  Schema,
  model,
  type InferSchemaType,
} from "mongoose";

import {
  RiskLevel,
  ScanStatus,
} from "../types/scan.types.js";

const scanSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    scanId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    jobUrl: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(ScanStatus),
      required: true,
      default: ScanStatus.QUEUED,
    },

    riskScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    riskLevel: {
      type: String,
      enum: Object.values(RiskLevel),
    },

    error: {
      type: String,
    },

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

scanSchema.index({ userId: 1, createdAt: -1 });

export type ScanDocument =
  InferSchemaType<typeof scanSchema>;

export const Scan =
  model("Scan", scanSchema);