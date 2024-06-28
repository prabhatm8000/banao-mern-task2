import type { Request, Response } from "express";
import type { UserDataType } from "../types";
import User from "../models/user";
import jwt from "jsonwebtoken";

export const registration = async (req: Request, res: Response) => {
    try {
        const userData: UserDataType = req.body;

        if (!userData.email || !userData.password || !userData.username)
            return res.status(400).send({
                message: "username, Email and password are required.",
            });

        if (!userData.email.includes("@"))
            return res.status(400).send({ message: "Invalid email." });

        let user = await User.findOne({ email: userData.email });

        if (user)
            return res.status(400).send({ message: "Email already exists." });

        user = new User(userData);
        await user.save();

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "3d" }
        );

        res.cookie("auth_token", token, {
            httpOnly: true, // cookies only for the server
            secure: process.env.ENV === "production", // cookie only works in https
            sameSite: process.env.ENV === "production" ? "none" : undefined,
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in miliseconds
        });

        res.status(200).send({ username: user.username, userId: user._id });
    } catch (error) {
        res.status(500).send({
            message: "Something went wrong while registering user.",
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const userData: UserDataType = req.body;

        if (!userData.username || !userData.password)
            return res
                .status(400)
                .send({ message: "Username and password are required." });

        let user = await User.findOne({ username: userData.username });
        if (!user) return res.status(404).send({ message: "User not found" });

        const isMatch = await user.matchPassword(userData.password);
        if (!isMatch)
            return res.status(400).send({ message: "Invalid credentials." });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET as string,
            { expiresIn: "3d" }
        );

        res.cookie("auth_token", token, {
            httpOnly: true, // cookies only for the server
            secure: process.env.ENV === "production", // cookie only works in https
            sameSite: process.env.ENV === "production" ? "none" : undefined,
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in miliseconds
        });

        res.status(200).send({ username: user.username, userId: user._id });
    } catch (error) {
        res.status(500).send({
            message: "Something went wrong while logging in.",
        });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("auth_token");
        res.status(200).send({ message: "Logged out successfully." });
    } catch (error) {
        res.status(500).send({
            message: "Something went wrong while logging out.",
        });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const userData: UserDataType = req.body;

        if (!userData.email || !userData.username)
            return res
                .status(400)
                .send({ message: "Email and username is required." });

        const user = await User.findOne({
            email: userData.email,
            username: userData.username,
        });
        if (!user) return res.status(400).send({ message: "User not found." });

        if (!userData.password)
            return res
                .status(400)
                .send({ message: "new password is required." });

        await User.findOneAndUpdate(
            { email: userData.email, username: userData.username },
            { password: userData.password },
            { new: true }
        );

        res.status(200).send({ message: "Password changed." });
    } catch (error) {
        res.status(500).send({
            message: "Something went wrong while resetting password.",
        });
    }
};

export const getMyUserData = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.userId);
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({
            message: "Something went wrong while getting user data.",
        });
    }
};
