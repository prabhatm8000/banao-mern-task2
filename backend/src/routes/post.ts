import { Router } from "express";
import {
    addPost,
    deletePost,
    getAllPosts,
    getPostsByUserId,
    likeUnlikePost,
    updatePost,
} from "../controllers/post";
import multer from "multer";
import verifyToken from "../middleware/authToken";

const postRouter = Router();

postRouter.use(verifyToken);

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const MAX_LENGTH_OF_IMAGES = 3;

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
}); // 3MB file size limit

postRouter.post("/", upload.array("imageFiles", MAX_LENGTH_OF_IMAGES), addPost);
postRouter.get("/all", getAllPosts);

postRouter.get("/by-userId", getPostsByUserId);

postRouter.delete("/:id", deletePost);

postRouter.patch(
    "/",
    upload.array("imageFiles", MAX_LENGTH_OF_IMAGES),
    updatePost
);

postRouter.post("/:id/likeUnlike", likeUnlikePost);

export default postRouter;
