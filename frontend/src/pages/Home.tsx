import { useCallback, useEffect, useRef, useState } from "react";
import { IoMdCreate } from "react-icons/io";
import AddEditPostModal from "../components/AddEditPostModal";
import { useAppContext } from "../hooks/useAppContext";
import { usePostContext } from "../hooks/usePostContext";
import PostCard from "../components/PostCard";
import type { PostDataType } from "../../../backend/src/types";
import PostModal from "../components/PostModal";

const Home = () => {
    const [tab, setTab] = useState<"all" | "my">("all");
    const [showAddEditPostModal, setShowAddEditPostModal] =
        useState<boolean>(false);
    const [postDataForEdit, setPostDataForEdit] = useState<
        PostDataType | undefined
    >();
    const [postDataForView, setPostDataForView] = useState<
        PostDataType | undefined
    >();

    const { toggleDarkMask, currentUser } = useAppContext();
    const {
        allPosts,
        myPosts,
        fetchAllPosts,
        fetchMyPosts,
        isLoadingPosts,
        hasMoreAllPosts,
        hasMoreMyPosts,
    } = usePostContext();

    const handleEdit = (post: PostDataType) => {
        setPostDataForEdit(post);
        setShowAddEditPostModal(true);
    };

    const postsObserver = useRef<IntersectionObserver | null>();

    const lastPostCardRef = useCallback(
        (element: HTMLDivElement) => {
            // my posts can only be fetched once currentUser is set
            if (isLoadingPosts || (tab === "my" && !currentUser)) return;

            if (postsObserver.current) postsObserver.current.disconnect();

            postsObserver.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    console.log(
                        "Intersecting",
                        tab + " posts",
                        hasMoreAllPosts || hasMoreMyPosts
                    );

                    if (tab === "all" && hasMoreAllPosts) fetchAllPosts();
                    if (tab === "my" && hasMoreMyPosts) fetchMyPosts();
                }
            });

            if (element) postsObserver.current?.observe(element);
        },
        [isLoadingPosts, hasMoreAllPosts, hasMoreMyPosts, tab, currentUser]
    );

    useEffect(() => {
        if (tab === "all") fetchAllPosts();
        if (tab === "my") fetchMyPosts();
    }, [tab]);

    useEffect(() => {
        if (postDataForView || showAddEditPostModal) toggleDarkMask(true);
        else toggleDarkMask(false);
    }, [showAddEditPostModal, toggleDarkMask, postDataForView]);

    return (
        <>
            <div className="backdrop-blur-sm bg-white/10 sticky top-[68px] sm:top-[72px] z-[100]">
                <ul className="flex justify-start items-center gap-4 container mx-auto px-4 w-full border-b border-white/20 ">
                    <li
                        onClick={() => setTab("all")}
                        className={`${
                            tab === "all"
                                ? "text-lg font-semibold py-3 border-b border-white/60"
                                : "text-sm font-light"
                        } cursor-pointer`}
                    >
                        All Posts
                    </li>
                    <li
                        onClick={() => setTab("my")}
                        className={`${
                            tab === "my"
                                ? "text-lg font-semibold py-3 border-b border-white/60"
                                : "text-sm font-light"
                        } cursor-pointer`}
                    >
                        My Posts
                    </li>
                </ul>
            </div>

            <div className={`container mx-auto px-4`}>
                {/* Create btn */}
                <button
                    className="fixed z-[50] bottom-0 right-0 m-5 md:m-10 rounded-full bg-gradient-to-b from-blue-500 from-40% to-blue-400  p-4 focus:outline-none"
                    onClick={() => setShowAddEditPostModal(true)}
                >
                    <IoMdCreate size={30} />
                </button>

                {/* Posts */}
                {tab === "all" && allPosts && allPosts.length > 0 ? (
                    <div className="my-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 justify-center items-center gap-4 w-full">
                        {allPosts.map((post, index) => {
                            if (index === allPosts.length - 1) {
                                return (
                                    <div key={post._id} ref={lastPostCardRef}>
                                        <PostCard
                                            setPostDataForView={
                                                setPostDataForView
                                            }
                                            handleEdit={handleEdit}
                                            postData={post}
                                        />
                                    </div>
                                );
                            }
                            return (
                                <div key={post._id}>
                                    <PostCard
                                        setPostDataForView={setPostDataForView}
                                        handleEdit={handleEdit}
                                        postData={post}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : tab === "my" && myPosts && myPosts.length > 0 ? (
                    <div className="my-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 justify-center items-center gap-4 w-full">
                        {myPosts.map((post, index) => {
                            if (index === myPosts.length - 1) {
                                return (
                                    <div key={post._id} ref={lastPostCardRef}>
                                        <PostCard
                                            setPostDataForView={
                                                setPostDataForView
                                            }
                                            handleEdit={handleEdit}
                                            postData={post}
                                        />
                                    </div>
                                );
                            }
                            return (
                                <div key={post._id}>
                                    <PostCard
                                        setPostDataForView={setPostDataForView}
                                        handleEdit={handleEdit}
                                        postData={post}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div
                        key={"no-my-posts"}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center h-full"
                    >
                        No posts, add posts.
                    </div>
                )}
            </div>

            {showAddEditPostModal && (
                <AddEditPostModal
                    postData={postDataForEdit}
                    setPostDataToUndefined={() => setPostDataForEdit(undefined)}
                    close={() => setShowAddEditPostModal(false)}
                />
            )}

            {postDataForView && (
                <PostModal
                    postData={postDataForView}
                    close={() => setPostDataForView(undefined)}
                />
            )}
        </>
    );
};

export default Home;
