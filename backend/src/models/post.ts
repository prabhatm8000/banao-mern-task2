import mongoose, { type Schema } from "mongoose";
import type { PostDataType } from "../types";

const mediaSchema: Schema = new mongoose.Schema({
    public_id: { type: String, required: true },
    url: { type: String, required: true },
});

const postSchema = new mongoose.Schema<PostDataType>(
    {
        userId: {
            type: String,
            required: true,
            ref: "users",
        },
        title: {
            type: String,
            required: true,
        },
        caption: {
            type: String,
            required: true,
        },
        images: [mediaSchema],
        likesCount: {
            type: Number,
            default: 0,
        },
        commentsCount: {
            type: Number,
            default: 0,
        },
        likes: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Post = mongoose.model<PostDataType>("posts", postSchema);
export default Post;
