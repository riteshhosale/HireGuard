import { Schema, model, type InferSchemaType } from "mongoose";

const communityCommentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "CommunityPost", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true, trim: true, minlength: 2, maxlength: 2000 },
  },
  { timestamps: true },
);

communityCommentSchema.index({ postId: 1, createdAt: 1 });

export type CommunityCommentDocument = InferSchemaType<typeof communityCommentSchema>;
export const CommunityComment = model("CommunityComment", communityCommentSchema);
