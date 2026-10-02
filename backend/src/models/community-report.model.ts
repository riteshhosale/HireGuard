import { Schema, model } from "mongoose";

const communityReportSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "CommunityPost", required: true, index: true },
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reason: { type: String, required: true, enum: ["SPAM", "HARASSMENT", "PERSONAL_INFORMATION", "MISLEADING", "MALICIOUS", "OTHER"] },
  },
  { timestamps: true },
);

communityReportSchema.index({ postId: 1, reporterId: 1 }, { unique: true });
export const CommunityReport = model("CommunityReport", communityReportSchema);
