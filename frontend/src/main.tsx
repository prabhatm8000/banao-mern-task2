import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App.tsx";
import { AppContextProvider } from "./contexts/AppContext.tsx";
import { PostContextProvider } from "./contexts/PostContext.tsx";
import "./index.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 0,
        },
    },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <AppContextProvider>
            <PostContextProvider>
                <App />
            </PostContextProvider>
        </AppContextProvider>
    </QueryClientProvider>
);
