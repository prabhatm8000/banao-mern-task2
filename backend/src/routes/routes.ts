import { Router } from "express";
import authRouter from "./auth";
import postRouter from "./post";
import commentRouter from "./comment";

const routes = Router();
routes.use("/auth", authRouter);
routes.use("/post", postRouter);
routes.use("/comment", commentRouter);

export default routes;
