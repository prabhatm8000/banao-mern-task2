import type { Request, Response } from "express";
import {
    deletePostFromCloudinary,
    uploadPostToCloudinary,
} from "../lib/cloudinary";
import Post from "../models/post";
import User from "../models/user";
import type { MediaDataType } from "../types";
import mongoose from "mongoose";

export const addPost = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const {
            title,
            caption,
        }: {
            title: string;
            caption: string;
        } = req.body;

        const imageFiles = req.files as Express.Multer.File[];

        if (!title || !caption || !imageFiles) {
            return res
                .status(400)
                .send({ message: "All fields are required." });
        }

        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        const imagesMediaData: MediaDataType[] = [];

        for (let i = 0; i < imageFiles.length; i++) {
            const image = imageFiles[i];
            const imageData: MediaDataType | null =
                await uploadPostToCloudinary(image);
            if (!imageData) {
                return res.status(500).send({
                    message: "Something went wrong while uploading image.",
                });
            }
            imagesMediaData.push({
                ...imageData,
            });
        }

        const newPost = new Post({
            userId,
            title,
            caption,
            images: imagesMediaData,
        });
        await newPost.save();

        const response = {
            _id: newPost._id,
            userInfo: {
                _id: user._id,
                username: user.username,
            },
            title: newPost.title,
            caption: newPost.caption,
            images: newPost.images,
            likesCount: newPost.likesCount,
            commentsCount: newPost.commentsCount,
            createdAt: newPost.createdAt,
            updatedAt: newPost.updatedAt,
        };

        res.status(201).send(response);
    } catch (error) {
        res.status(500).send({
            message: "Something went wrong while adding post.",
        });
    }
};

export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const posts = await Post.aggregate([
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
                    as: "userInfo",
                },
            },
            {
                $unwind: {
                    path: "$userInfo",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    userInfo: {
                        _id: "$userInfo._id",
                        username: "$userInfo.username",
                    },
                    title: 1,
                    caption: 1,
                    images: 1,
                    isLiked: {
                        $in: ["$userId", "$likes"],
                    },
                    likesCount: 1,
                    commentsCount: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
            {
                $sort: { updatedAt: -1 },
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
        ]);

        const response = posts.map((post) => {
            return {
                _id: post._id,
                userInfo: post.userInfo,
                title: post.title,
                caption: post.caption,
                images: post.images,
                isLiked: post.isLiked,
                likesCount: post.likesCount,
                commentsCount: post.commentsCount,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
            };
        });
        res.status(200).send(response);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Something went wrong while getting posts.",
        });
    }
};

export const getPostsByUserId = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const userId = (req.query.userId as string) || req.userId;

        const posts = await Post.aggregate([
            {
                $match: {
                    userId,
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
                    as: "userInfo",
                },
            },
            {
                $unwind: {
                    path: "$userInfo",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    userInfo: {
                        _id: "$userInfo._id",
                        username: "$userInfo.username",
                    },
                    title: 1,
                    caption: 1,
                    images: 1,
                    isLiked: {
                        $in: ["$userId", "$likes"],
                    },
                    likesCount: 1,
                    commentsCount: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
            {
                $sort: { updatedAt: -1 },
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
        ]);

        const response = posts.map((post) => {
            return {
                _id: post._id,
                userInfo: post.userInfo,
                title: post.title,
                caption: post.caption,
                images: post.images,
                isLiked: post.isLiked,
                likesCount: post.likesCount,
                commentsCount: post.commentsCount,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
            };
        });

        res.status(200).send(response);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Something went wrong while getting posts by userId.",
        });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    try {
        const post = await Post.findById(req.params.id, {
            images: 1,
            userId: 1,
        });

        if (!post) {
            return res.status(404).send({
                message: "Post not found.",
            });
        }

        if (post.userId.toString() !== req.userId) {
            return res.status(403).send({
                message: "You can only delete your own posts.",
            });
        }

        for (let i = 0; i < post.images.length; i++) {
            const flag = await deletePostFromCloudinary(
                post.images[i].public_id
            );
            if (!flag) {
                return res.status(500).send({
                    message: "Something went wrong while deleting post.",
                });
            }
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).send({
            message: "Post deleted successfully.",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Something went wrong while deleting post.",
        });
    }
};

export const updatePost = async (req: Request, res: Response) => {
    try {
        const {
            postId,
            title,
            caption,
        }: { postId: string; title: string; caption: string } = req.body;

        const post = await Post.findById(postId, {
            images: 1,
            userId: 1,
        });
        console.log(postId);

        if (!post) {
            return res.status(404).send({
                message: "Post not found.",
            });
        }

        if (post.userId.toString() !== req.userId) {
            return res.status(403).send({
                message: "You can only update your own posts.",
            });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).send({
                message: "User not found.",
            });
        }

        const imageFiles = req.files as Express.Multer.File[];
        const imagesMediaData: MediaDataType[] = [];
        if (imageFiles && imageFiles.length > 0) {
            // upload new images
            for (let i = 0; i < imageFiles.length; i++) {
                const image = imageFiles[i];
                const imageData: MediaDataType | null =
                    await uploadPostToCloudinary(image);
                if (!imageData) {
                    return res.status(500).send({
                        message: "Something went wrong while updating post.",
                    });
                }
                imagesMediaData.push(imageData);
            }

            // delete old images
            for (let i = 0; i < post.images.length; i++) {
                const flag = await deletePostFromCloudinary(
                    post.images[i].public_id
                );
                if (!flag) {
                    return res.status(500).send({
                        message: "Something went wrong while updating post.",
                    });
                }
            }
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            {
                title,
                caption,
                images:
                    imagesMediaData.length > 0 ? imagesMediaData : post.images,
            },
            {
                new: true,
                projection: {
                    userId: 1,
                    title: 1,
                    caption: 1,
                    images: 1,
                    likesCount: 1,
                    commentsCount: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            }
        );

        if (!updatedPost) {
            return res.status(500).send({
                message: "Something went wrong while updating post.",
            });
        }

        const response = {
            _id: updatedPost._id,
            userId: updatedPost.userId,
            userInfo: {
                _id: user._id,
                username: user.username,
            },
            title: updatedPost.title,
            caption: updatedPost.caption,
            images: updatedPost.images,
            likesCount: updatedPost.likesCount,
            commentsCount: updatedPost.commentsCount,
            createdAt: updatedPost.createdAt,
            updatedAt: updatedPost.updatedAt,
        };

        res.status(200).send(response);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Something went wrong while updating post.",
        });
    }
};

export const likeUnlikePost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id as string;

        const post = await Post.findById(postId, {
            userId: 1,
        });
        if (!post) {
            return res.status(404).send({
                message: "Post not found.",
            });
        }

        // if req.userId present in post.likes then remove it else add it and increment likesCount accordingly
        const isLiked = await Post.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(postId),
                },
            },
            {
                $project: {
                    isLiked: {
                        $in: [req.userId, "$likes"],
                    },
                },
            },
        ]);

        if (isLiked[0].isLiked) {
            await Post.findByIdAndUpdate(postId, {
                $pull: { likes: req.userId },
                $inc: { likesCount: -1 },
            });
        } else {
            await Post.findByIdAndUpdate(postId, {
                $push: { likes: req.userId },
                $inc: { likesCount: 1 },
            });
        }

        res.status(200).send({
            isLiked: !isLiked[0].isLiked,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Something went wrong while liking/unliking post.",
        });
    }
};
