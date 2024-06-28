import { formatDistanceToNow } from "date-fns";
import type { CommentDataType } from "../../../backend/src/types";
import { useAppContext } from "../hooks/useAppContext";
import { useEffect, useState } from "react";

const CommentCard = ({
    commentData,
    handleDeleteBtn,
    isDeleting,
}: {
    commentData: CommentDataType;
    handleDeleteBtn: (commentId: string) => void;
    isDeleting: boolean;
}) => {
    const { currentUser } = useAppContext();
    const [deleteBtnClicked, setDeleteBtnClicked] = useState<boolean>(false);

    useEffect(() => {
        if (!isDeleting) {
            setDeleteBtnClicked(false);
        }
    }, [isDeleting]);

    return (
        <div className="border border-white/15 rounded-md px-2 py-1">
            <div className="flex items-center gap-1 text-white/60 text-xs">
                <span>{commentData.userInfo?.username}</span>
                <span>•</span>
                <span>
                    {formatDistanceToNow(
                        new Date(commentData.updatedAt).toISOString(),
                        {
                            addSuffix: true,
                        }
                    )}
                </span>
            </div>
            <div className="flex flex-col items-end">
                <p className="text-sm w-full">{commentData.comment}</p>
                {currentUser?._id === commentData.userId && (
                    <button
                        className="text-sm px-1 py0.5 rounded-md bg-red-500 w-fit"
                        onClick={() => {
                            handleDeleteBtn(commentData._id);
                            setDeleteBtnClicked(true);
                        }}
                        disabled={isDeleting}
                    >
                        {isDeleting && deleteBtnClicked
                            ? "Deleting..."
                            : "Delete"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default CommentCard;
