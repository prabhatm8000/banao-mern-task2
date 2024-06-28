import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAppContext } from "./hooks/useAppContext";
import WithNavBar from "./layouts/WithNavBar";
import Login from "./pages/Login";
import Home from "./pages/Home";

const App = () => {
    const { isLoggedIn } = useAppContext();

    return (
        <BrowserRouter>
            <Routes>
                {isLoggedIn ? (
                    <>
                        <Route
                            path="/home"
                            element={
                                <WithNavBar>
                                    <Home />
                                </WithNavBar>
                            }
                        />
                        <Route path="*" element={<Navigate to="/home" />} />
                    </>
                ) : (
                    <>
                        <Route
                            path="/login"
                            element={
                                <WithNavBar>
                                    <Login />
                                </WithNavBar>
                            }
                        />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </>
                )}
            </Routes>
        </BrowserRouter>
    );
};

export default App;
