
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import LikeService from "../services/likeService";

function LikedComments() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);

    const fetchLikedComments = async () => {
        try {
            setLoading(true);

            const response = await LikeService.getLikedComments();

            const data = response?.data;

            const likedComments = Array.isArray(data)
                ? data
                : data?.likedComments || data?.comments || [];

            setComments(likedComments);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to load liked comments"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLikedComments();
    }, []);

    const handleUnlike = async (commentId) => {
        try {
            setRemovingId(commentId);

            await LikeService.toggleCommentLike(commentId);

            setComments((previous) =>
                previous.filter((item) => {
                    const comment = item.comment || item;
                    return comment?._id !== commentId;
                })
            );

            toast.success("Comment removed from liked comments");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to unlike comment"
            );
        } finally {
            setRemovingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-600 border-t-red-600" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold md:text-3xl">
                    Liked comments
                </h1>

                <p className="mt-2 text-sm text-neutral-400">
                    Comments you have liked
                </p>
            </div>

            {comments.length === 0 ? (
                <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-neutral-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7 10v12m0-12 4-8a3 3 0 0 1 2 3v5h5a2 2 0 0 1 2 2l-2 7a2 2 0 0 1-2 2H7m0-11H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h5"
                            />
                        </svg>
                    </div>

                    <h2 className="text-xl font-semibold">
                        No liked comments yet
                    </h2>

                    <p className="mt-2 text-sm text-neutral-400">
                        Comments you like will appear here.
                    </p>

                    <Link
                        to="/"
                        className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-neutral-200"
                    >
                        Explore videos
                    </Link>
                </div>
            ) : (
                <div className="divide-y divide-neutral-800">
                    {comments.map((item) => {
                        const comment = item.comment || item;
                        const video = comment?.video;
                        const owner = comment?.owner;

                        if (!comment?._id) {
                            return null;
                        }

                        return (
                            <div
                                key={item._id || comment._id}
                                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="mb-3 flex items-center gap-3">
                                        {owner?.avatar ? (
                                            <img
                                                src={owner.avatar}
                                                alt={owner.username || "User"}
                                                className="h-9 w-9 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-700 font-semibold">
                                                {(owner?.username || "U")
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                {owner?.fullname ||
                                                    owner?.username ||
                                                    "YouTube user"}
                                            </p>

                                            <p className="text-xs text-neutral-500">
                                                Liked comment
                                            </p>
                                        </div>
                                    </div>

                                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-neutral-200">
                                        {comment.content ||
                                            "Comment content unavailable"}
                                    </p>

                                    {video?._id && (
                                        <Link
                                            to={`/watch/${video._id}`}
                                            className="mt-3 inline-block text-sm text-blue-400 hover:text-blue-300"
                                        >
                                            Video: {video.title || "Watch video"}
                                        </Link>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleUnlike(comment._id)}
                                    disabled={removingId === comment._id}
                                    className="shrink-0 self-start rounded-full border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {removingId === comment._id
                                        ? "Removing..."
                                        : "Unlike"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default LikedComments;
