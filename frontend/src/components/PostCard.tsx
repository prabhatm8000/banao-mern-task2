import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { BiCommentDetail, BiLike, BiSolidLike } from "react-icons/bi";
import { CgSpinnerTwo } from "react-icons/cg";
import { IoPersonCircle } from "react-icons/io5";
import { SlOptions } from "react-icons/sl";
import type { PostDataType } from "../../../backend/src/types";
import * as apiClient from "../apiClient";
import { useAppContext } from "../hooks/useAppContext";
import { usePostContext } from "../hooks/usePostContext";
import Carousel from "./Carousel";

const PostCard = ({
    postData,
    handleEdit,
    setPostDataForView,
}: {
    postData: PostDataType;
    handleEdit: (postData: PostDataType) => void;
    setPostDataForView: (postData: PostDataType) => void;
}) => {
    const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);

    const { currentUser, showToast } = useAppContext();
    const { deletePost, updatePostCountValue } = usePostContext();

    const [isLoadingLike, setIsLoadingLike] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const handleDeleteBtn = async () => {
        setIsDeleting(true);
        await deletePost(postData._id);
        setIsDeleting(false);
    };

    const handleEditBtn = () => {
        handleEdit(postData);
        setIsOptionsOpen(false);
    };

    const handleViewBtn = () => {
        setPostDataForView(postData);
        setIsOptionsOpen(false);
    };

    const handleLikeBtn = async () => {
        setIsLoadingLike(true);
        try {
            const response = await apiClient.likeUnlikePost(postData._id);
            if (response.isLiked) {
                updatePostCountValue(postData._id, 1, "likes");
            } else {
                updatePostCountValue(postData._id, -1, "likes");
            }
        } catch (error: any) {
            console.error(error);
            showToast({ message: error.message, type: "error" });
        }
        setIsLoadingLike(false);
    };

    // useEffect(() => {
    //     const handleEscapeKeyEvent = (e: KeyboardEvent) => {
    //         console.log(e.key);

    //         if (e.key === "Escape" && isOptionsOpen) {
    //             setIsOptionsOpen(false);
    //         }
    //     };

    //     addEventListener("keypress", handleEscapeKeyEvent);

    //     return () => {
    //         removeEventListener("keypress", handleEscapeKeyEvent);
    //     };
    // }, []);

    return (
        <div className="bg-white/5 border border-white/15 rounded-lg w-full h-[500px] grid grid-rows-[60px_380px_60px] relative overflow-hidden">
            <div className="flex items-center gap-2 w-full px-4 py-2">
                <IoPersonCircle size={50} />
                <div className="flex items-center justify-between gap-2 w-full text-sm text-white/60">
                    <span className="">{postData.userInfo?.username}</span>
                    <span>
                        {formatDistanceToNow(
                            new Date(postData.updatedAt).toISOString()
                        )}
                    </span>
                </div>
            </div>

            <div className="px-4 pb-2">
                <h2
                    className="text-2xl font-semibold line-clamp-1 cursor-pointer"
                    onClick={handleViewBtn}
                >
                    {postData.title}
                </h2>
                <p
                    className="font-light text-white/90 line-clamp-1 cursor-pointer"
                    onClick={handleViewBtn}
                >
                    {postData.caption}
                </p>
                {postData.images && postData.images.length > 0 && (
                    <Carousel autoSlide={false} imageUrls={postData.images} />
                )}
            </div>

            <div className="p-4 border-t border-t-white/15 w-full flex justify-around items-center">
                <button
                    className="flex items-center gap-1"
                    onClick={() => handleLikeBtn()}
                    disabled={isLoadingLike}
                >
                    {isLoadingLike ? (
                        <CgSpinnerTwo className="animate-spin" size={24} />
                    ) : (
                        <>
                            {postData.isLiked ? (
                                <BiSolidLike
                                    className="text-blue-500"
                                    size={24}
                                />
                            ) : (
                                <BiLike size={24} />
                            )}
                        </>
                    )}
                    <span>{postData.likesCount}</span>
                </button>
                <button
                    className="flex items-center gap-1"
                    onClick={handleViewBtn}
                >
                    <BiCommentDetail size={24} />
                    <span>{postData.commentsCount}</span>
                </button>
                <button onClick={() => setIsOptionsOpen((prev) => !prev)}>
                    <SlOptions
                        className={isOptionsOpen ? "text-blue-500" : ""}
                        size={24}
                    />
                </button>

                {isOptionsOpen && (
                    <div className="absolute bottom-8 right-0 m-4 w-fit rounded-md shadow-lg bg-stone-800 ring-1 ring-black ring-opacity-5">
                        <div
                            className="py-1"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="options-menu"
                        >
                            {postData.userInfo?._id === currentUser?._id && (
                                <>
                                    <button
                                        className="block px-4 py-2 text-sm w-full"
                                        role="menuitem"
                                        onClick={() => handleEditBtn()}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        disabled={isDeleting}
                                        className="px-4 py-2 text-sm w-full flex justify-center items-center gap-1 disabled:text-white/50"
                                        role="menuitem"
                                        onClick={handleDeleteBtn}
                                    >
                                        {isDeleting ? (
                                            <>
                                                <CgSpinnerTwo
                                                    size={24}
                                                    className="animate-spin"
                                                />
                                                <span>Deleting</span>
                                            </>
                                        ) : (
                                            "Delete"
                                        )}
                                    </button>
                                </>
                            )}
                            <button
                                className="block px-4 py-2 text-sm w-full"
                                role="menuitem"
                                onClick={handleViewBtn}
                            >
                                View
                            </button>
                            <button
                                className="block px-4 py-2 text-sm w-full"
                                role="menuitem"
                                // onClick={() => handleReportBtn()}
                            >
                                Other
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostCard;
