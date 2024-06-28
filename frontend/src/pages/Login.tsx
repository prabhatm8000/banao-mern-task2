import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import * as apiClient from "../apiClient";
import { useAppContext } from "../hooks/useAppContext";
import { CgSpinnerTwo } from "react-icons/cg";

const Login = () => {
    const [formType, setFormType] = useState<"login" | "register" | "forgot">(
        "login"
    );
    const {
        login,
        register: registerUser,
        showToast,
        loadingAuthResponse,
    } = useAppContext();
    const {
        register,
        reset,
        getValues,
        formState: { errors },
        handleSubmit,
    } = useForm();

    const handleFormTypeChange = (type: "login" | "register" | "forgot") => {
        setFormType(type);
        reset();
    };

    const { mutate: forgotPassword } = useMutation(apiClient.forgotPassword, {
        onError: (error: Error) => {
            showToast({ message: error.message, type: "error" });
        },
        onSuccess: () => {
            showToast({ message: "Password reset", type: "success" });
        },
    });

    const onSubmit = handleSubmit((formData) => {
        const username = formData.username;
        const email = formData.email;
        const password = formData.password;

        let errorFlag = false;

        switch (formType) {
            case "login":
                if (!username || !password) {
                    errorFlag = true;
                    break;
                }
                login(username.toString(), password.toString());
                break;
            case "register":
                if (!username || !password || !email) {
                    errorFlag = true;
                    break;
                }
                registerUser(
                    username.toString(),
                    email.toString(),
                    password.toString()
                );
                break;
            case "forgot":
                if (!username || !password || !email) {
                    errorFlag = true;
                    break;
                }
                forgotPassword({
                    email: email.toString(),
                    username: username.toString(),
                    newPassword: password.toString(),
                });
                break;
        }

        if (errorFlag) {
            return showToast({
                message: "All fields are required",
                type: "error",
            });
        }
    });

    return (
        <div className="container mx-auto px-4">
            <form
                onSubmit={onSubmit}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center flex-col gap-8 p-6 bg-stone-950 border border-white/10 rounded-lg w-80"
            >
                <h1 className="text-3xl text-left w-full font-semibold">
                    {formType === "login"
                        ? "Login"
                        : formType === "register"
                        ? "Register"
                        : "Password Reset"}
                </h1>

                <div className="flex justify-center items-center flex-col gap-2 w-full">
                    {(formType === "register" || formType === "forgot") && (
                        <>
                            <input
                                type="email"
                                placeholder="Email"
                                className={`bg-inherit p-3 w-full focus:outline-none rounded-lg border focus:border-blue-400 placeholder:text-white/60 ${
                                    errors.email
                                        ? "border-red-500"
                                        : "border-white/15"
                                }`}
                                {...register("email", {
                                    required: "Email is required",
                                })}
                            />
                            {errors.email && (
                                <span className="text-red-500 text-xs text-start w-full font-light">
                                    *{errors.email.message?.toString()}
                                </span>
                            )}
                        </>
                    )}
                    <input
                        type="text"
                        placeholder="Username"
                        className={`bg-inherit p-3 w-full focus:outline-none rounded-lg border focus:border-blue-400 placeholder:text-white/60 ${
                            errors.username
                                ? "border-red-500"
                                : "border-white/15"
                        }`}
                        {...register("username", {
                            required: "Username is required",
                            pattern: {
                                value: /^[a-zA-Z0-9]+$/,
                                message:
                                    "Username should only contain letters and numbers",
                            },
                        })}
                    />
                    {errors.username && (
                        <span className="text-red-500 text-xs text-start w-full font-light">
                            *{errors.username.message?.toString()}
                        </span>
                    )}

                    <input
                        type="password"
                        placeholder="Password"
                        className={`bg-inherit p-3 w-full focus:outline-none rounded-lg border focus:border-blue-400 placeholder:text-white/60 ${
                            errors.password
                                ? "border-red-500"
                                : "border-white/15"
                        }`}
                        {...register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 8,
                                message:
                                    "Password should be at least 8 characters",
                            },
                        })}
                    />
                    {errors.password && (
                        <span className="text-red-500 text-xs text-start w-full font-light">
                            *{errors.password.message?.toString()}
                        </span>
                    )}

                    {(formType === "forgot" || formType === "register") && (
                        <>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                className={`bg-inherit p-3 w-full focus:outline-none rounded-lg border focus:border-blue-400 placeholder:text-white/60 ${
                                    errors.confirmPassword
                                        ? "border-red-500"
                                        : "border-white/15"
                                }`}
                                {...register("confirmPassword", {
                                    required: "Confirm Password is required",
                                    validate: (value) =>
                                        value === getValues("password") ||
                                        "Passwords do not match",
                                })}
                            />

                            {errors.confirmPassword && (
                                <span className="text-red-500 text-xs text-start w-full font-light">
                                    *
                                    {errors.confirmPassword.message?.toString()}
                                </span>
                            )}
                        </>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loadingAuthResponse}
                    className="bg-blue-400 px-6 py-2 w-fit rounded-full disabled:bg-gray-400 hover:bg-blue-500 hover:px-8 transition-all duration-300 delay-75 focus:outline-none"
                >
                    {loadingAuthResponse ? (
                        <CgSpinnerTwo className="animate-spin" size={24} />
                    ) : (
                        <>
                            {formType === "login"
                                ? "Login"
                                : formType === "forgot"
                                ? "Reset"
                                : "Register"}
                        </>
                    )}
                </button>

                <div className="flex flex-col items-center justify-center w-full text-sm text-white/80">
                    <div className="flex items-center gap-1">
                        {formType === "login" ? (
                            <>
                                <span>Account not registered?</span>
                                <button
                                    onClick={() =>
                                        handleFormTypeChange("register")
                                    }
                                    type="reset"
                                    className="text-blue-400 bg-transparent focus:outline-none"
                                >
                                    Register
                                </button>
                            </>
                        ) : (
                            <>
                                {formType === "register" && (
                                    <span>Already have an account?</span>
                                )}
                                {formType === "forgot" && (
                                    <span>Remember your password?</span>
                                )}
                                <button
                                    onClick={() =>
                                        handleFormTypeChange("login")
                                    }
                                    type="reset"
                                    className="text-blue-400 bg-transparent focus:outline-none"
                                >
                                    Login
                                </button>
                            </>
                        )}
                    </div>

                    {formType === "login" && (
                        <button
                            onClick={() => handleFormTypeChange("forgot")}
                            type="reset"
                            className="bg-transparent focus:outline-none"
                        >
                            Forgot Password?
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Login;
