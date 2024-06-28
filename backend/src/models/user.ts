import mongoose from "mongoose";
import type { UserDataType } from "../types";
import { comparePassword, hashPassword } from "../lib/hashing";

interface UserModel extends UserDataType {
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<UserModel>({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

// mongodb middleware for save
// password hashing
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await hashPassword(this.password);
    }
    next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
    this.set("password", await hashPassword(this.get("password")));
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await comparePassword(enteredPassword, this.password);
};

const User = mongoose.model<UserModel>("users", userSchema);
export default User;
