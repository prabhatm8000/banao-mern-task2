import mongoose from "mongoose";
import type { CommentDataType } from "../types";

const commentSchema = new mongoose.Schema<CommentDataType>(
    {
        userId: {
            type: String,
            required: true,
            ref: "users",
        },
        postId: {
            type: String,
            required: true,
            ref: "posts",
        },
        comment: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Comment = mongoose.model<CommentDataType>("comments", commentSchema);
export default Comment;
