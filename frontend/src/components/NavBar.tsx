import { RiLogoutBoxLine } from "react-icons/ri";
import { useAppContext } from "../hooks/useAppContext";
import { IoPersonCircle } from "react-icons/io5";
import { FaGithub } from "react-icons/fa";

const NavBar = () => {
    const { currentUser, logout } = useAppContext();
    return (
        <nav className="container mx-auto p-4 flex justify-between items-center">
            <a href="" className="focus:outline-none flex items-center gap-1">
                <FaGithub size={40} />
                <h1 className="text-3xl font-bold">ATG Media</h1>
            </a>

            {currentUser && (
                <ul className="flex items-center gap-3">
                    <li className="flex items-center gap-2">
                        <IoPersonCircle size={30} className="hidden sm:block" />
                        <span>{currentUser.username}</span>
                    </li>
                    <li>
                        <button
                            onClick={logout}
                            className="px-2 py-2 sm:px-4 sm:py-2 bg-red-400 text-white rounded-full sm:rounded-md focus:outline-none flex justify-center items-center gap-1"
                        >
                            <span className="text-xl">
                                <RiLogoutBoxLine />
                            </span>
                            <span className="hidden sm:block">Logout</span>
                        </button>
                    </li>
                </ul>
            )}
        </nav>
    );
};

export default NavBar;
