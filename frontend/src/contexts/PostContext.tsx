import { createContext, useState } from "react";
import type { PostDataType } from "../../../backend/src/types";
import * as apiClient from "../apiClient";
import { useAppContext } from "../hooks/useAppContext";
import React from "react";

export type PostContextType = {
    allPosts: PostDataType[];
    myPosts: PostDataType[];
    isLoadingPosts: boolean;
    allPostsPagesFetched: number;
    myPostsPagesFetched: number;
    hasMoreAllPosts: boolean;
    hasMoreMyPosts: boolean;
    fetchAllPosts: () => Promise<number>;
    fetchMyPosts: () => Promise<number>;
    deletePost: (postId: string) => Promise<boolean>;
    updatePost: (post: PostDataType) => Promise<void>;
    addPost: (post: PostDataType) => Promise<void>;
    updatePostCountValue: (
        postId: string,
        incrementBy: number,
        value: "comments" | "likes"
    ) => void;
};

export const PostContext = createContext<PostContextType | null>(null);

const FETCH_LIMIT = 5;

export const PostContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const { currentUser, showToast } = useAppContext();
    const [allPosts, setAllPosts] = useState<PostDataType[]>([]);
    const [myPosts, setMyPosts] = useState<PostDataType[]>([]);

    const [isLoadingPosts, setIsLoadingPosts] = useState(false);

    const [allPostsPagesFetched, setAllPostsPagesFetched] = useState(0);
    const [myPostsPagesFetched, setMyPostsPagesFetched] = useState(0);

    const [hasMoreAllPosts, setHasMoreAllPosts] = useState(true);
    const [hasMoreMyPosts, setHasMoreMyPosts] = useState(true);

    const fetchAllPosts = async (): Promise<number> => {
        if (!hasMoreAllPosts) return -1;

        setIsLoadingPosts(true);
        try {
            const response = await apiClient.getAllPosts(
                allPostsPagesFetched + 1,
                FETCH_LIMIT
            );

            if (response.length < FETCH_LIMIT) {
                setHasMoreAllPosts(false);
            }

            setAllPostsPagesFetched((prev) => prev + 1);
            setAllPosts((prev) => {
                const newPosts = response.filter(
                    (post) => !prev.find((p) => p._id === post._id)
                );

                return [...prev, ...newPosts];
            });
            return allPostsPagesFetched + 1;
        } catch (error: any) {
            console.error(error);
            if ("message" in error) {
                showToast({
                    message: error.message,
                    type: "error",
                });
            }
        }
        setIsLoadingPosts(false);
        return -1;
    };

    const fetchMyPosts = async (): Promise<number> => {
        if (!currentUser || !hasMoreMyPosts) return -1;

        setIsLoadingPosts(true);
        try {
            const response = await apiClient.getPostsByUserId(
                currentUser._id,
                myPostsPagesFetched + 1,
                FETCH_LIMIT
            );

            if (response.length < FETCH_LIMIT) {
                setHasMoreMyPosts(false);
            }

            setMyPostsPagesFetched((prev) => prev + 1);
            setMyPosts((prev) => {
                const newPosts = response.filter(
                    (post) => !prev.find((p) => p._id === post._id)
                );

                return [...prev, ...newPosts];
            });
            return myPostsPagesFetched + 1;
        } catch (error: any) {
            console.error(error);
            if ("message" in error) {
                showToast({
                    message: error.message,
                    type: "error",
                });
            }
        }
        setIsLoadingPosts(false);
        return -1;
    };

    const deletePost = async (postId: string) => {
        try {
            const response = await apiClient.deletePost(postId);

            const filteredAllPosts = allPosts.filter(
                (post) => post._id !== postId
            );
            setAllPosts(filteredAllPosts);

            const filteredMyPosts = myPosts.filter(
                (post) => post._id !== postId
            );
            setMyPosts(filteredMyPosts);

            showToast({
                message: response.message,
                type: "success",
            });

            return true;
        } catch (error: any) {
            console.error(error);
            if ("message" in error) {
                showToast({
                    message: error.message,
                    type: "error",
                });
            }
            return false;
        }
    };

    const updatePost = async (post: PostDataType) => {
        const updatedAllPosts = allPosts.map((p) =>
            p._id === post._id ? post : p
        );
        setAllPosts(updatedAllPosts);
        const updatedMyPosts = myPosts.map((p) =>
            p._id === post._id ? post : p
        );
        setMyPosts(updatedMyPosts);
    };

    const addPost = async (post: PostDataType) => {
        setAllPosts((prev) => {
            if (!prev.find((p) => p._id === post._id)) {
                return [post, ...prev];
            }
            return prev;
        });
        setMyPosts((prev) => {
            if (!prev.find((p) => p._id === post._id)) {
                return [post, ...prev];
            }
            return prev;
        });
    };

    const updatePostCountValue = (
        postId: string,
        incrementBy: number,
        value: "comments" | "likes"
    ) => {
        // helper function
        const handleOperation = (prev: PostDataType[]) => {
            const post = prev.find((p) => p._id === postId);
            if (post) {
                if (value === "comments") {
                    post.commentsCount += incrementBy;
                }
                if (value === "likes") {
                    post.likesCount += incrementBy;
                    post.isLiked = !post.isLiked;
                }
            }
            return [...prev];
        };

        setAllPosts(handleOperation);
        setMyPosts(handleOperation);
    };

    return (
        <PostContext.Provider
            value={{
                allPosts,
                myPosts,
                isLoadingPosts,
                allPostsPagesFetched,
                myPostsPagesFetched,
                hasMoreAllPosts,
                hasMoreMyPosts,
                fetchAllPosts,
                fetchMyPosts,
                deletePost,
                updatePost,
                addPost,
                updatePostCountValue,
            }}
        >
            {children}
        </PostContext.Provider>
    );
};
