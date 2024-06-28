import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CgSpinnerTwo } from "react-icons/cg";
import { CiImageOn } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { useAppContext } from "../hooks/useAppContext";
import { useMutation } from "react-query";
import * as apiClient from "../apiClient";
import { compressImage } from "../lib/imageCompression";
import { usePostContext } from "../hooks/usePostContext";
import type { PostDataType } from "../../../backend/src/types";

const AddEditPostModal = ({
    close,
    postData,
    setPostDataToUndefined,
}: {
    close: () => void;
    postData?: PostDataType;
    setPostDataToUndefined?: () => void;
}) => {
    const {
        register,
        watch,
        reset,
        setValue,
        formState: { errors },
        setError,
        clearErrors,
        handleSubmit,
    } = useForm();

    const { showToast } = useAppContext();
    const { addPost: addInPostState, updatePost: updatePostInPostState } =
        usePostContext();

    useEffect(() => {
        if (postData) {
            setValue("title", postData.title);
            setValue("caption", postData.caption);
        }
    }, [postData]);

    const handleCloseBtn = () => {
        close();
        reset();
        setImageDataUrls([]);
        setPostDataToUndefined();
    };

    const { mutate: addPost, isLoading: uploading } = useMutation(
        apiClient.addPost,
        {
            onSuccess: (data) => {
                showToast({ message: "Post created", type: "success" });
                handleCloseBtn();
                addInPostState(data);
            },
            onError: (error: Error) => {
                showToast({ message: error.message, type: "error" });
            },
        }
    );

    const { mutate: updatePost, isLoading: updating } = useMutation(
        apiClient.updatePost,
        {
            onSuccess: (data) => {
                showToast({ message: "Post updated", type: "success" });
                handleCloseBtn();
                updatePostInPostState(data);
            },
            onError: (error: Error) => {
                showToast({ message: error.message, type: "error" });
            },
        }
    );

    const [imageDataUrls, setImageDataUrls] = useState<string[]>([]);

    useEffect(() => {
        const imageFiles = watch("imageFiles");
        if (!imageFiles) return;

        if (imageFiles.length > 3) {
            setError("imageFiles", {
                type: "maxLength",
                message: "You can only select up to 3 images",
            });
            setImageDataUrls([]);
            return;
        }

        if (imageFiles.length > 0 && imageFiles.length < 4) {
            // when new image is selected open crop window
            clearErrors("imageFiles");
            setImageDataUrls([]);
            for (let index = 0; index < imageFiles.length; index++) {
                const reader = new FileReader();
                reader.readAsDataURL(imageFiles[index]);
                reader.onload = () => {
                    if (typeof reader.result === "string") {
                        setImageDataUrls((prev) => [
                            ...prev,
                            reader.result as string,
                        ]);
                    }
                };
            }
        } else {
            if (postData) {
                setImageDataUrls(postData.images.map((image) => image.url));
            } else {
                setImageDataUrls([]);
            }
        }
    }, [watch("imageFiles"), postData]);

    const onSubmit = handleSubmit(async (data) => {
        if (postData) {
            if (
                postData.title === data.title &&
                postData.caption === data.caption &&
                data.imageFiles.length === 0
            ) {
                showToast({ message: "No changes made", type: "success" });
                handleCloseBtn();
                return;
            }
        }

        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("caption", data.caption);

        // image compression
        const compressedImageFiles = await compressImage(data.imageFiles);

        Array.from(compressedImageFiles).forEach((file) => {
            formData.append("imageFiles", file);
        });

        if (postData) {
            formData.append("postId", postData._id);
            updatePost(formData);
        } else {
            addPost(formData);
        }
    });

    return (
        <div className="fixed z-[60] bottom-0 sm:top-1/2 left-1/2 -translate-x-1/2 sm:-translate-y-1/2 h-fit max-h-[700px] min-w-[300px] w-full max-w-[500px] bg-stone-950 px-8 pb-8 space-y-8 rounded-lg border border-white/10">
            <button
                onClick={handleCloseBtn}
                className="absolute top-0 right-0 m-6 p-0.5 bg-white/10 rounded-full border border-white/15 focus:outline-none "
            >
                <IoClose size={24} />
            </button>
            <h1 className="text-3xl">
                {postData ? "Edit Post" : "What is happening?!"}
            </h1>

            <form
                autoComplete="off"
                encType="multipart/form-data"
                className="space-y-8"
                onSubmit={onSubmit}
            >
                <div className="w-full flex flex-col justify-center items-center gap-2">
                    <input
                        type="text"
                        placeholder="Title"
                        className={`bg-inherit p-3 w-full focus:outline-none rounded-lg border focus:border-blue-400 placeholder:text-white/60 ${
                            errors.title ? "border-red-500" : "border-white/15"
                        }`}
                        {...register("title", {
                            required: "Title is required.",
                            maxLength: 100,
                        })}
                    />
                    {errors.title && (
                        <span className="text-red-500 text-xs text-start w-full font-light">
                            *{errors.title.message?.toString()}
                        </span>
                    )}

                    <textarea
                        placeholder="Caption"
                        className={`bg-inherit p-3 w-full focus:outline-none rounded-lg border focus:border-blue-400 placeholder:text-white/60 ${
                            errors.caption
                                ? "border-red-500"
                                : "border-white/15"
                        }`}
                        rows={3}
                        {...register("caption", {
                            required: "Caption is required.",
                            maxLength: {
                                value: 800,
                                message:
                                    "Caption cannot exceed 800 characters.",
                            },
                        })}
                    ></textarea>
                    {errors.caption && (
                        <span className="text-red-500 text-xs text-start w-full font-light">
                            *{errors.caption.message?.toString()}
                        </span>
                    )}

                    <div
                        className={`bg-inherit p-3 w-full rounded-lg border ${
                            errors.imageFiles
                                ? "border-red-500"
                                : "border-white/15"
                        }`}
                    >
                        <label
                            htmlFor="imageFiles"
                            title="Add images"
                            className="text-blue-400 text-sm cursor-pointer"
                        >
                            <CiImageOn size={24} />
                        </label>

                        <input
                            type="file"
                            id="imageFiles"
                            accept="image/*"
                            multiple
                            className="hidden"
                            {...register("imageFiles", {
                                validate: (value) => {
                                    if (!postData && value.length === 0) {
                                        return "Images are required.";
                                    }
                                },
                                maxLength: 3,
                            })}
                        />
                        {errors.imageFiles && (
                            <span className="text-red-500 text-xs text-start w-full font-light">
                                *{errors.imageFiles.message?.toString()}
                            </span>
                        )}

                        {imageDataUrls.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {imageDataUrls.map((imageDataUrl, index) => (
                                    <img
                                        src={imageDataUrl}
                                        key={"image-preview-" + index}
                                        className="size-28 object-cover rounded-lg border border-white/15"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <span className="flex justify-end w-full">
                    <button
                        disabled={uploading || updating}
                        type="submit"
                        className="bg-blue-400 flex justify-center items-center gap-1 px-6 py-2 w-fit rounded-full hover:bg-blue-500 disabled:bg-gray-400 focus:outline-none"
                    >
                        {uploading || updating ? (
                            <>
                                <CgSpinnerTwo
                                    size={24}
                                    className="animate-spin"
                                />
                                <span>{postData ? "Updating" : "Posting"}</span>
                            </>
                        ) : postData ? (
                            "Update"
                        ) : (
                            "Post"
                        )}
                    </button>
                </span>
            </form>
        </div>
    );
};

export default AddEditPostModal;
