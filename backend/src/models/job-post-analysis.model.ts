import { Schema, model, type InferSchemaType } from "mongoose";

export const JOB_RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type JobRiskLevel = (typeof JOB_RISK_LEVELS)[number];

const findingSchema = new Schema({
  code: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: JOB_RISK_LEVELS, required: true },
  points: { type: Number, min: 0, required: true },
}, { _id: false });

const jobPostAnalysisSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  sourceUrl: { type: String, required: true, trim: true },
  jobTitle: { type: String, trim: true },
  companyName: { type: String, trim: true },
  description: { type: String, trim: true, maxlength: 30000 },
  applicationUrl: { type: String, trim: true },
  riskScore: { type: Number, min: 0, max: 100, required: true },
  riskLevel: { type: String, enum: JOB_RISK_LEVELS, required: true },
  findings: { type: [findingSchema], default: [] },
  extractionStatus: { type: String, enum: ["EXTRACTED", "PARTIAL", "FAILED"], required: true },
  extractionMessage: { type: String },
  analyzedAt: { type: Date, default: Date.now },
}, { timestamps: true });

jobPostAnalysisSchema.index({ userId: 1, analyzedAt: -1 });

export type JobPostAnalysisDocument = InferSchemaType<typeof jobPostAnalysisSchema>;
export const JobPostAnalysis = model("JobPostAnalysis", jobPostAnalysisSchema);
