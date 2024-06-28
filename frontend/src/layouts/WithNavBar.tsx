import DarkMask from "../components/DarkMask";
import NavBar from "../components/NavBar";
import { useAppContext } from "../hooks/useAppContext";

const WithNavBar = ({ children }: { children: React.ReactNode }) => {
    const { isDarkMaskOn } = useAppContext();
    return (
        <div className="text-white bg-black min-h-screen relative">
            {isDarkMaskOn && <DarkMask />}
            <header className="bg-white/10 backdrop-blur-sm sticky top-0 z-[100]">
                <NavBar />
            </header>
            <div className="">{children}</div>
        </div>
    );
};

export default WithNavBar;
