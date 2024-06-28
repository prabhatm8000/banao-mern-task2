import type { Request, Response } from "express";
import Comment from "../models/comments";
import Post from "../models/post";
import User from "../models/user";

export const addComment = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const postId = req.params.postId as string;
        const { comment }: { comment: string } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send({ message: "Post not found." });
        }

        const commentData = new Comment({
            userId,
            postId,
            comment,
        });
        await commentData.save();

        // increment comment count
        await Post.findOneAndUpdate(
            { _id: post._id },
            { $inc: { commentsCount: 1 } }
        );

        const response = {
            _id: commentData._id,
            userId: commentData.userId,
            userInfo: {
                _id: user._id,
                username: user.username,
            },
            postId: commentData.postId,
            comment: commentData.comment,
            createdAt: commentData.createdAt,
            updatedAt: commentData.updatedAt,
        };

        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({
            message: "Something went wrong while adding comment.",
        });
    }
};

export const getComments = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 1;

        const comments = await Comment.aggregate([
            {
                $match: {
                    postId,
                },
            },
            {
                $lookup: {
                    from: "users",
                    let: { userId: "$userId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", { $toObjectId: "$$userId" }],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                username: 1,
                            },
                        },
                    ],
                    as: "user",
                },
            },
            {
                $unwind: "$user",
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    postId: 1,
                    comment: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    userInfo: {
                        _id: "$user._id",
                        username: "$user.username",
                    },
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
        ]);

        res.status(200).send(comments);
    } catch (error) {
        res.status(500).send({
            message: "Something went wrong while getting comments.",
        });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const commentId = req.params.id;
        const userId = req.userId;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).send({ message: "Comment not found." });
        }

        if (comment.userId.toString() !== userId) {
            return res.status(403).send({ message: "Unauthorized." });
        }

        await Comment.findByIdAndDelete(commentId);

        // decrement comment count
        const post = await Post.findOneAndUpdate(
            { _id: comment.postId },
            { $inc: { commentsCount: -1 } },
            { new: true }
        );
        res.status(200).send({ message: "Comment deleted successfully." });
    } catch (error) {
        res.status(500).send({
            message: "Something went wrong while deleting comment.",
        });
    }
};
