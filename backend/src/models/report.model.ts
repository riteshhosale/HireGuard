import {
  Schema,
  model,
  type InferSchemaType,
} from "mongoose";

const aiFindingSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },

    severity: {
      type: String,
      required: true,
    },

    explanation: {
      type: String,
      required: true,
    },

    evidence: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const aiAnalysisSchema = new Schema(
  {
    risk_level: {
      type: String,
      required: true,
      enum: [
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
      ],
    },

    summary: {
      type: String,
      required: true,
    },

    findings: {
      type: [aiFindingSchema],
      default: [],
    },

    recommended_action: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const reportSchema = new Schema(
  {
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

    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    riskLevel: {
      type: String,
      required: true,
      enum: [
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
      ],
    },

    summary: {
      type: String,
      required: true,
    },

    findings: {
      type: [Schema.Types.Mixed],
      default: [],
    },

    timeline: {
      type: [Schema.Types.Mixed],
      default: [],
    },

    domainChecks: {
      type: Schema.Types.Mixed,
      default: {},
    },

    recommendedAction: {
      type: String,
      required: true,
    },

    /*
     * Gemini AI analysis.
     *
     * This is additional analysis and does NOT
     * replace the deterministic risk engine result.
     */
    aiAnalysis: {
      type: aiAnalysisSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export type ReportDocument =
  InferSchemaType<typeof reportSchema>;

export const Report =
  model<ReportDocument>(
    "Report",
    reportSchema,
  );