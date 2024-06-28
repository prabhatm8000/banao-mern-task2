import {
    UserDataType,
    type CommentDataType,
    type PostDataType,
} from "../../backend/src/types";

const API_BASE_URL = "";

export const login = async (
    username: string,
    password: string
): Promise<UserDataType> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
};

export const register = async (
    username: string,
    email: string,
    password: string
): Promise<UserDataType> => {
    const response = await fetch(`${API_BASE_URL}/auth/registration`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
};

export const verifyToken = async (): Promise<{ userId: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
};

export const logout = async (): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        credentials: "include",
        method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
};

export const forgotPassword = async ({
    email,
    username,
    newPassword,
}: {
    email: string;
    username: string;
    newPassword: string;
}): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
};

export const getMyUserData = async (): Promise<UserDataType> => {
    const response = await fetch(`${API_BASE_URL}/auth/get-my-userdata`, {
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
};

export const addPost = async (
    postFormData: FormData
): Promise<PostDataType> => {
    const response = await fetch(`${API_BASE_URL}/post/`, {
        credentials: "include",
        method: "POST",
        body: postFormData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
};

export const getAllPosts = async (
    page: number,
    limit: number
): Promise<PostDataType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/post/all?page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
};

export const getPostsByUserId = async (
    userId: string,
    page: number,
    limit: number
): Promise<PostDataType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/post/by-userId?userId=${userId}&page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
};

export const deletePost = async (
    postId: string
): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/post/${postId}`, {
        credentials: "include",
        method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
};

export const updatePost = async (
    postFormData: FormData
): Promise<PostDataType> => {
    const response = await fetch(`${API_BASE_URL}/post/`, {
        credentials: "include",
        method: "PATCH",
        body: postFormData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
};

export const likeUnlikePost = async (
    postId: string
): Promise<{ isLiked: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/post/${postId}/likeUnlike`, {
        credentials: "include",
        method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
};

export const commentOnPost = async (commentData: {
    postId: string;
    comment: string;
}): Promise<CommentDataType> => {
    const response = await fetch(
        `${API_BASE_URL}/comment/${commentData.postId}`,
        {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ comment: commentData.comment }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
};

export const deleteComment = async (
    commentId: string
): Promise<{ message: string; commentId: string }> => {
    const response = await fetch(`${API_BASE_URL}/comment/${commentId}`, {
        credentials: "include",
        method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    data.commentId = commentId;
    return data;
};

export const getComments = async (
    postId: string,
    page: number,
    limit: number
): Promise<CommentDataType[]> => {
    const response = await fetch(
        `${API_BASE_URL}/comment/${postId}?page=${page}&limit=${limit}`,
        {
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data;
};
