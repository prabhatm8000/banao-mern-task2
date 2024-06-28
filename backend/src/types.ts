export type UserDataType = {
    _id: string;
    username: string;
    email: string;
    password: string;
};

export type MediaDataType = {
    public_id: string;
    url: string;
};

export type PostDataType = {
    _id: string;
    userId: string;
    userInfo?: {
        _id: string;
        username: string;
    };
    title: string;
    caption: string;
    images: MediaDataType[];
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
    likes: string[];
    createdAt: Date;
    updatedAt: Date;
};

export type CommentDataType = {
    _id: string;
    postId: string;
    userId: string;
    userInfo?: {
        _id: string;
        username: string;
    };
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}