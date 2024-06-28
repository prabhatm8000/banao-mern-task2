import cloudinary from "cloudinary";
import type { MediaDataType } from "../types";

export const connectCloudinary = (
    cloud_name: string,
    api_key: string,
    api_secret: string
) => {
    cloudinary.v2.config({
        cloud_name,
        api_key,
        api_secret,
    });
};

export const uploadPostToCloudinary = async (
    imageFile: Express.Multer.File
): Promise<MediaDataType | null> => {
    try {
        const base64 = Buffer.from(imageFile.buffer).toString("base64");

        const dataURI = `data:${imageFile.mimetype};base64,${base64}`;

        const result = await cloudinary.v2.uploader.upload(dataURI, {
            folder: "bano/posts",
        });
        return {
            public_id: result.public_id,
            url: result.secure_url,
        };
    } catch (error) {
        console.log("Error uploading image to cloudinary: ", error);
        return null;
    }
};

export const deletePostFromCloudinary = async (
    public_id: string
): Promise<boolean> => {
    try {
        const result = await cloudinary.v2.uploader.destroy(public_id);
        return result.result === "ok";
    } catch (error) {
        console.log("Error uploading image to cloudinary: ", error);
        return false;
    }
};
