import { IoClose, IoPersonCircle, IoSend } from "react-icons/io5";
import type { CommentDataType, PostDataType } from "../../../backend/src/types";
import Carousel from "./Carousel";
import { formatDistanceToNow } from "date-fns";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "react-query";
import * as apiClient from "../apiClient";
import { useAppContext } from "../hooks/useAppContext";
import { useCallback, useRef, useState } from "react";
import CommentCard from "./CommentCard";
import { usePostContext } from "../hooks/usePostContext";

const FETCH_LIMIT = 5;

const PostModal = ({
    postData,
    close,
}: {
    postData: PostDataType;
    close: () => void;
}) => {
    const [comments, setComments] = useState<CommentDataType[]>([]);
    const [commentsPage, setCommentsPage] = useState<number>(1);
    const [hasMoreComments, setHasMoreComments] = useState<boolean>(true);

    const handleCloseBtn = () => {
        close();
    };

    const {
        register,
        formState: { errors },
        handleSubmit,
        reset,
    } = useForm();

    const { showToast } = useAppContext();
    const { updatePostCountValue } = usePostContext();

    // posting comment
    const { mutate } = useMutation(apiClient.commentOnPost, {
        onSuccess: (data) => {
            showToast({ message: "Comment posted", type: "success" });
            setComments((prev) => {
                if (!prev.find((c) => c._id === data._id)) {
                    return [data, ...prev];
                }
                return prev;
            });
            reset();
            updatePostCountValue(postData._id, 1, "comments");
        },
        onError: (error: any) => {
            console.log(error);
            showToast({ message: error.message, type: "error" });
        },
    });

    const onSubmitComment = handleSubmit((formData) => {
        console.log(formData);
        const data = {
            postId: postData._id,
            comment: formData.comment,
        };
        mutate(data);
    });

    // comments fetching
    const { isFetching: isLoadingComments, refetch } = useQuery(
        "fetching-comments",
        () => apiClient.getComments(postData._id, commentsPage, FETCH_LIMIT),
        {
            enabled: false,
            keepPreviousData: true,
            refetchOnWindowFocus: false,
            onSuccess: (data) => {
                if (data.length < FETCH_LIMIT) {
                    setHasMoreComments(false);
                }
                setComments((prev) => {
                    const newComments = data.filter(
                        (comment) => !prev.find((c) => c._id === comment._id)
                    );

                    return [...prev, ...newComments];
                });
            },
            onError: (error: any) => {
                console.log(error);
                showToast({ message: error.message, type: "error" });
            },
        }
    );

    const commentsObserver = useRef<IntersectionObserver | null>();

    const lastCommentCardRef = useCallback(
        (element: HTMLDivElement) => {
            // my posts can only be fetched once currentUser is set
            if (isLoadingComments) return;

            if (commentsObserver.current) commentsObserver.current.disconnect();

            commentsObserver.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMoreComments) {
                    // fecth comments
                    setCommentsPage((prev) => prev + 1);
                    refetch();
                }
            });

            if (element) commentsObserver.current?.observe(element);
        },
        [isLoadingComments]
    );

    // deleting comment
    const { mutate: deleteComment, isLoading: isDeletingComment } = useMutation(
        apiClient.deleteComment,
        {
            onSuccess: (data) => {
                showToast({ message: data.message, type: "success" });
                setComments((prev) =>
                    prev.filter((c) => c._id !== data.commentId)
                );

                updatePostCountValue(postData._id, -1, "comments");
            },
            onError: (error: any) => {
                console.log(error);
                showToast({ message: error.message, type: "error" });
            },
        }
    );

    return (
        <div className="fixed z-[100] bottom-0 sm:top-1/2 left-1/2 -translate-x-1/2 sm:-translate-y-1/2 h-[calc(100vh-200px)] sm:h-[calc(100vh-150px)] w-full sm:w-[500px] md:w-[600px] lg:w-[800px] bg-stone-950 pb-8 space-y-8 rounded-t-lg sm:rounded-lg border border-white/10 overflow-hidden">
            <button
                onClick={handleCloseBtn}
                className="absolute z-[101] top-0 right-0 m-3 p-0.5 bg-white/10 rounded-full border border-white/15 focus:outline-none "
            >
                <IoClose size={24} />
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] h-full overflow-y-auto lg:overflow-y-hidden">
                {/* postData */}
                <div className="px-6 lg:overflow-y-auto">
                    <h1 className="text-3xl font-bold">{postData.title}</h1>
                    <p className="font-light">{postData.caption}</p>
                    {postData.images && postData.images.length > 0 && (
                        <Carousel
                            autoSlide={false}
                            imageUrls={postData.images}
                            hightClass="h-[calc(500px-56px-16px)] mt-2"
                        />
                    )}
                    <div className="flex items-start justify-between w-full mt-6 text-white/60">
                        <div className="flex gap-2 items-center">
                            <IoPersonCircle size={50} className="text-white" />
                            <span>{postData.userInfo?.username}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span>{postData.likesCount} likes</span>
                            <span>{postData.commentsCount} comments</span>
                            <span>
                                {"• "}
                                {formatDistanceToNow(
                                    new Date(postData.updatedAt).toISOString()
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* comments */}
                <div className="lg:overflow-y-auto relative mb-2">
                    <div className="sticky -top-1 left-0 space-y-2 px-6 py-3 bg-stone-950">
                        <h2 className="text-xl font-bold">Comments</h2>
                        <form
                            className="flex gap-2"
                            onSubmit={onSubmitComment}
                            autoComplete="off"
                        >
                            <div className="flex flex-col w-full">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    className="w-full p-2 bg-white/10 rounded-lg border border-white/15 focus:outline-none focus:border-blue-500 placeholder:text-white/60"
                                    {...register("comment", {
                                        required: "Comment is required",
                                    })}
                                />
                                {errors.comment && (
                                    <span className="text-red-500 text-xs">
                                        *{errors.comment.message.toString()}
                                    </span>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="p-2 size-10 bg-blue-500 disabled:bg-gray-400 rounded-full focus:outline-none"
                            >
                                <IoSend size={24} />
                            </button>
                        </form>
                    </div>

                    <div className="h-full px-6 flex flex-col space-y-2">
                        {comments.length === 0 && (
                            <span
                                ref={lastCommentCardRef}
                                className="text-white/60"
                            >
                                No comments yet
                            </span>
                        )}
                        {comments.map((comment, index) => {
                            if (comments.length === index + 1) {
                                return (
                                    <div
                                        key={comment._id}
                                        ref={lastCommentCardRef}
                                    >
                                        <CommentCard
                                            handleDeleteBtn={deleteComment}
                                            isDeleting={isDeletingComment}
                                            commentData={comment}
                                        />
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={comment._id}>
                                        <CommentCard
                                            handleDeleteBtn={deleteComment}
                                            isDeleting={isDeletingComment}
                                            commentData={comment}
                                        />
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostModal;
