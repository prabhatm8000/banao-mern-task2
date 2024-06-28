import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

// adding userId to Express -> Request
declare global {
    namespace Express {
        interface Request {
            userId: string;
        }
    }
}

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const authToken = req.cookies["auth_token"];
    if (!authToken) {
        return res.status(401).send({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET as string); //getting id(userId)
        const user = await User.findById((decoded as any).id);

        if (!user) {
            return res.status(401).send({ message: "Unauthorized" });
        }

        req.userId = user._id.toString();
        next();
    } catch (error) {
        return res.status(401).send({ message: "Unauthorized" });
    }
};

export default verifyToken;