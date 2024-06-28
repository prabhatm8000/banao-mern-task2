import { Router } from "express";
import { addComment, deleteComment, getComments } from "../controllers/comment";
import verifyToken from "../middleware/authToken";

const commentRouter = Router();

commentRouter.use(verifyToken);
commentRouter.post("/:postId", addComment);
commentRouter.get("/:postId", getComments);
commentRouter.delete("/:id", deleteComment);

export default commentRouter;
