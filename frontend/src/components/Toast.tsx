import { useEffect, useState } from "react";
import type { ToastMessage } from "../contexts/AppContext";

const TOAST_TIMEOUT = 6000;

const Toast = ({
    toast,
    close,
}: {
    toast: ToastMessage | undefined;
    close: () => void;
}) => {
    const [countDown, setCountDown] = useState<number>(TOAST_TIMEOUT);
    const [isVisible, setIsVisible] = useState<boolean>(true);

    useEffect(() => {
        if (!toast) return;
        setIsVisible(true);

        setCountDown(TOAST_TIMEOUT);

        const interval = setInterval(() => {
            setCountDown((prev) => {
                return prev - 1000 >= 0 ? prev - 1000 : 0;
            });
        }, 1000);

        const timeoutHide = setTimeout(() => {
            clearInterval(interval);
            setIsVisible(false);
        }, TOAST_TIMEOUT);

        const timeout = setTimeout(() => {
            clearTimeout(timeoutHide);
            close();
        }, TOAST_TIMEOUT + 1000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeoutHide);
            clearTimeout(timeout);
        };
    }, [toast, close]);
    return (
        toast && (
            <div
                className={`z-[100] fixed bottom-0 left-0 m-4 px-5 py-3 text-white rounded-md border-b-4 border-white/10 ${
                    toast.type === "success"
                        ? "bg-blue-500/30"
                        : "bg-red-500/30"
                } ${
                    isVisible
                        ? "scale-100 translate-y-0"
                        : "scale-0 translate-y-[50%]"
                } transition-transform duration-300 ease-in-out`}
            >
                {toast.message}
                <span
                    className={`absolute bottom-0 left-0 translate-y-[100%] py-[2px] rounded-full ${
                        toast.type === "success" ? "bg-blue-500" : "bg-red-500"
                    }`}
                    style={{
                        width: (countDown / TOAST_TIMEOUT) * 100 + "%",
                        transition: "linear",
                        transitionDuration: "1000ms",
                        transitionTimingFunction: "linear",
                        transitionProperty: "all",
                    }}
                ></span>
            </div>
        )
    );
};

export default Toast;
