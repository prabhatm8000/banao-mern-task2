import { Router, type Request, type Response } from "express";
import {
    forgotPassword,
    getMyUserData,
    login,
    logout,
    registration,
} from "../controllers/user";
import verifyToken from "../middleware/authToken";

const authRouter = Router();

authRouter.post("/registration", registration);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/forgot-password", forgotPassword);

authRouter.get("/get-my-userdata", verifyToken, getMyUserData);

authRouter.get("/verify-token", verifyToken, (req: Request, res: Response) => {
    res.status(200).send({ userId: req.userId });
});

export default authRouter;
