import { Schema, model, type InferSchemaType } from "mongoose";

export const COMMUNITY_CATEGORIES = [
  "FAKE_JOB",
  "FAKE_RECRUITER",
  "REGISTRATION_FEE",
  "WORK_FROM_HOME",
  "PAYMENT_SCAM",
  "PHISHING",
  "FAKE_WEBSITE",
  "IDENTITY_SCAM",
  "OTHER",
] as const;

export const CONTACT_METHODS = [
  "WHATSAPP",
  "TELEGRAM",
  "EMAIL",
  "PHONE",
  "LINKEDIN",
  "JOB_WEBSITE",
  "SMS",
  "OTHER",
] as const;

const communityPostSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 8, maxlength: 180 },
    description: { type: String, required: true, trim: true, minlength: 20, maxlength: 6000 },
    category: { type: String, enum: COMMUNITY_CATEGORIES, required: true, index: true },
    contactMethod: { type: String, enum: CONTACT_METHODS, default: "OTHER" },
    suspiciousUrl: { type: String, trim: true, maxlength: 2048 },
    scanId: { type: String, trim: true, index: true },
    riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL", "SAFE", "EVALUATING"] },
    scanAttached: { type: Boolean, default: false },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    savedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    commentsCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["PUBLISHED", "HIDDEN", "REMOVED"], default: "PUBLISHED", index: true },
  },
  { timestamps: true },
);

communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ category: 1, createdAt: -1 });

export type CommunityPostDocument = InferSchemaType<typeof communityPostSchema>;
export const CommunityPost = model("CommunityPost", communityPostSchema);
