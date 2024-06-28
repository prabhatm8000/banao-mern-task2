import { createContext, useState } from "react";
import { useQuery } from "react-query";
import type { UserDataType } from "../../../backend/src/types";
import * as apiClient from "../apiClient";
import Toast from "../components/Toast";
import React from "react";

export type ToastMessage = {
    message: string;
    type: "success" | "error";
};

export type AppContextType = {
    showToast: (message: ToastMessage) => void;
    isDarkMaskOn: boolean;
    toggleDarkMask: (state: boolean) => void;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (
        username: string,
        email: string,
        password: string
    ) => Promise<void>;
    isLoggedIn: boolean;
    currentUser: UserDataType | undefined;
    loadingAuthResponse: boolean;
};

export const AppContext = createContext<AppContextType | null>(null);

export const AppContextProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [toast, setToast] = useState<ToastMessage>();
    const [DarkMaskState, setDarkMaskState] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserDataType>();
    const [loadingAuthResponse, setLoadingAuthResponse] = useState(false);

    const {} = useQuery("verify-token", apiClient.verifyToken, {
        refetchOnWindowFocus: true,
        onSuccess: (data) => {
            if (data) {
                setIsLoggedIn(true);
            }
        },
        onError: () => {
            setCurrentUser(undefined);
            setIsLoggedIn(false);
        },
    });

    const {} = useQuery("fetching-userData", apiClient.getMyUserData, {
        refetchOnWindowFocus: false,
        enabled: isLoggedIn,
        onSuccess: (data) => {
            if (data) {
                setCurrentUser(data);
                setToast({
                    message: "Login successful",
                    type: "success",
                });
            }
        },
        onError: () => {
            setCurrentUser(undefined);
            setIsLoggedIn(false);
        },
    });

    const register = async (
        username: string,
        email: string,
        password: string
    ) => {
        try {
            setLoadingAuthResponse(true);
            const response = await apiClient.register(
                username,
                email,
                password
            );
            if (response) {
                setCurrentUser(response);
                setIsLoggedIn(true);
                setToast({
                    message: "Registration successful",
                    type: "success",
                });
            }
        } catch (error: any) {
            setToast({
                message: error?.message || "Something went wrong",
                type: "error",
            });
        }
        setLoadingAuthResponse(false);
    };

    const login = async (username: string, password: string) => {
        try {
            setLoadingAuthResponse(true);
            const response = await apiClient.login(username, password);
            if (response) {
                setCurrentUser(response);
                setIsLoggedIn(true);
                setToast({
                    message: "Login successful",
                    type: "success",
                });
            }
        } catch (error: any) {
            setToast({
                message: error?.message || "Something went wrong",
                type: "error",
            });
        }
        setLoadingAuthResponse(false);
    };

    const logout = async () => {
        try {
            setLoadingAuthResponse(true);
            const response = await apiClient.logout();
            if (response) {
                setCurrentUser(undefined);
                setIsLoggedIn(false);
                setToast({
                    message: "Logout successful",
                    type: "success",
                });
                window.location.href = "/";
                window.location.reload();
            }
        } catch (error: any) {
            setToast({
                message: error?.message || "Something went wrong",
                type: "error",
            });
        }
        setLoadingAuthResponse(false);
    };

    return (
        <AppContext.Provider
            value={{
                showToast: (toast: ToastMessage) => {
                    setToast(toast);
                },
                isDarkMaskOn: DarkMaskState,
                toggleDarkMask: (state: boolean) => {
                    setDarkMaskState(state);
                },
                register,
                login,
                logout,
                isLoggedIn,
                currentUser,
                loadingAuthResponse,
            }}
        >
            <Toast toast={toast} close={() => setToast(undefined)} />
            {children}
        </AppContext.Provider>
    );
};
