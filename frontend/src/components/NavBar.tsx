import { RiLogoutBoxLine } from "react-icons/ri";
import { useAppContext } from "../hooks/useAppContext";
import { IoPersonCircle } from "react-icons/io5";

const NavBar = () => {
    const { currentUser, logout } = useAppContext();
    return (
        <nav className="container mx-auto p-4 flex justify-between items-center">
            <a href="" className="focus:outline-none">
                <h1 className="text-3xl font-bold">BanaoMern</h1>
            </a>

            {currentUser && (
                <ul className="flex items-center gap-4">
                    <li className="flex items-center gap-1">
                        <IoPersonCircle size={30} />
                        <span>{currentUser.username}</span>
                    </li>
                    <li>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-400 text-white rounded-md focus:outline-none flex justify-center items-center gap-1"
                        >
                            <span>
                                <RiLogoutBoxLine />
                            </span>
                            <span>Logout</span>
                        </button>
                    </li>
                </ul>
            )}
        </nav>
    );
};

export default NavBar;
