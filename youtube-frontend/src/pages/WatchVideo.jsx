import { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import {
    UserRound,
    Eye,
    Calendar,
    ListVideo,
    X,
    ThumbsUp,
    MessageCircle,
    Pencil,
    Trash2,
    Send,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function WatchVideo() {
    const { videoId } = useParams();
    const { user, loading: authLoading } = useContext(AuthContext);

    // Video states
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Subscription states
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [subscribing, setSubscribing] = useState(false);

    // Like states
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [liking, setLiking] = useState(false);

    // Comment states
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);

    // Playlist states
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [playlistsLoading, setPlaylistsLoading] = useState(false);
    const [addingPlaylistId, setAddingPlaylistId] = useState(null);

    const currentUserId = user?._id || user?.user?._id;

    // Fetch video details
    useEffect(() => {
        let cancelled = false;

        const fetchVideo = async () => {
            try {
                setLoading(true);
                setError("");
                setVideo(null);

                const response = await api.get(`/videos/${videoId}`);

                const result = response.data?.data;
                const videoData = result?.video || result;

                if (!videoData?._id) {
                    throw new Error("Video details were not found.");
                }

                if (cancelled) return;

                setVideo(videoData);

                const owner = videoData.owner || {};

                setIsSubscribed(
                    videoData.isSubscribed ??
                    owner.isSubscribed ??
                    false
                );

                setSubscriberCount(
                    videoData.subscriberCount ??
                    owner.subscriberCount ??
                    0
                );
            } catch (err) {
                if (!cancelled) {
                    console.error(
                        "Failed to fetch video:",
                        err.response?.data || err.message
                    );

                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        "Unable to load this video."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        if (videoId) {
            fetchVideo();
        }

        return () => {
            cancelled = true;
        };
    }, [videoId]);

    // Fetch comments for the current video
    useEffect(() => {
        let cancelled = false;

        const fetchComments = async () => {
            try {
                setCommentsLoading(true);
                setComments([]);

                const response = await api.get(`/comments/${videoId}`);

                const data = response.data?.data;

                if (!cancelled) {
                    setComments(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error(
                        "Failed to fetch comments:",
                        err.response?.data || err.message
                    );

                    toast.error(
                        err.response?.data?.message ||
                        "Unable to load comments."
                    );
                }
            } finally {
                if (!cancelled) {
                    setCommentsLoading(false);
                }
            }
        };

        if (videoId) {
            fetchComments();
        }

        return () => {
            cancelled = true;
        };
    }, [videoId]);

    // Fetch like status and count when the user is logged in
    useEffect(() => {
        let cancelled = false;

        const fetchLikeDetails = async () => {
            setIsLiked(false);
            setLikeCount(0);

            if (!user || !video?._id) {
                return;
            }

            try {
                const response = await api.get(
                    `/likes/video/${video._id}`
                );

                const data = response.data?.data;

                if (!cancelled) {
                    setIsLiked(Boolean(data?.isLiked));
                    setLikeCount(Number(data?.likeCount || 0));
                }
            } catch (err) {
                if (!cancelled) {
                    console.error(
                        "Failed to fetch like details:",
                        err.response?.data || err.message
                    );
                }
            }
        };

        fetchLikeDetails();

        return () => {
            cancelled = true;
        };
    }, [video?._id, user]);

    // Like or unlike the video
    const handleLike = async () => {
        if (!user) {
            toast.error("Please log in to like this video.");
            return;
        }

        if (!video?._id || liking) return;

        try {
            setLiking(true);

            const response = await api.post(
                `/likes/toggle/v/${video._id}`
            );

            const data = response.data?.data;

            if (typeof data?.liked !== "boolean") {
                toast.error("Unexpected response from the server.");
                return;
            }

            setIsLiked(data.liked);

            setLikeCount((count) =>
                Math.max(0, count + (data.liked ? 1 : -1))
            );

            toast.success(
                data.liked ? "Video liked!" : "Video unliked!"
            );
        } catch (err) {
            console.error(
                "Like request failed:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                "Unable to update like."
            );
        } finally {
            setLiking(false);
        }
    };

    // Subscribe or unsubscribe from the channel
    const handleSubscribe = async () => {
        if (!user) {
            toast.error("Please log in to subscribe.");
            return;
        }

        if (!video?.owner?._id) {
            toast.error("Channel information is unavailable.");
            return;
        }

        if (String(video.owner._id) === String(currentUserId)) {
            toast.error("You cannot subscribe to your own channel.");
            return;
        }

        if (subscribing) return;

        try {
            setSubscribing(true);

            const response = await api.post(
                `/subscriptions/c/${video.owner._id}`
            );

            const result = response.data?.data;

            if (typeof result?.subscribed !== "boolean") {
                toast.error("Unexpected subscription response.");
                return;
            }

            setIsSubscribed(result.subscribed);

            setSubscriberCount((count) =>
                Math.max(
                    0,
                    count + (result.subscribed ? 1 : -1)
                )
            );

            toast.success(
                result.subscribed
                    ? "Subscribed successfully!"
                    : "Unsubscribed successfully!"
            );
        } catch (err) {
            console.error(
                "Subscription failed:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                "Unable to update subscription."
            );
        } finally {
            setSubscribing(false);
        }
    };

    // Add a new comment
    const handleAddComment = async (e) => {
        e.preventDefault();

        const content = commentText.trim();

        if (!user) {
            toast.error("Please log in to comment.");
            return;
        }

        if (!content) {
            toast.error("Please enter a comment.");
            return;
        }

        if (commentSubmitting) return;

        try {
            setCommentSubmitting(true);

            const response = await api.post(
                `/comments/${videoId}`,
                { content }
            );

            const newComment = response.data?.data;

            if (!newComment?._id) {
                throw new Error("The server did not return the comment.");
            }

            // The add-comment endpoint returns an unpopulated owner ID.
            // Attach the current user's details for immediate display.
            const commentWithOwner = {
                ...newComment,
                owner: {
                    _id: currentUserId,
                    username: user.username || user.user?.username,
                    fullName:
                        user.fullName ||
                        user.fullname ||
                        user.user?.fullName ||
                        user.user?.fullname,
                    avatar: user.avatar || user.user?.avatar,
                },
            };

            setComments((previous) => [
                commentWithOwner,
                ...previous,
            ]);

            setCommentText("");
            toast.success("Comment added successfully!");
        } catch (err) {
            console.error(
                "Adding comment failed:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                err.message ||
                "Unable to add comment."
            );
        } finally {
            setCommentSubmitting(false);
        }
    };

    // Save changes to an existing comment
    const handleEditComment = async (commentId) => {
        const content = editingText.trim();

        if (!content) {
            toast.error("Comment cannot be empty.");
            return;
        }

        if (savingEdit) return;

        try {
            setSavingEdit(true);

            const response = await api.patch(
                `/comments/c/${commentId}`,
                { content }
            );

            const updatedComment = response.data?.data;

            setComments((previous) =>
                previous.map((comment) =>
                    comment._id === commentId
                        ? {
                              ...comment,
                              ...updatedComment,
                              owner: comment.owner,
                          }
                        : comment
                )
            );

            setEditingCommentId(null);
            setEditingText("");

            toast.success("Comment updated successfully!");
        } catch (err) {
            console.error(
                "Updating comment failed:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                "Unable to update comment."
            );
        } finally {
            setSavingEdit(false);
        }
    };

    // Delete a comment
    const handleDeleteComment = async (commentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this comment?"
        );

        if (!confirmed) return;

        try {
            setDeletingCommentId(commentId);

            await api.delete(`/comments/c/${commentId}`);

            setComments((previous) =>
                previous.filter(
                    (comment) => comment._id !== commentId
                )
            );

            if (editingCommentId === commentId) {
                setEditingCommentId(null);
                setEditingText("");
            }

            toast.success("Comment deleted successfully!");
        } catch (err) {
            console.error(
                "Deleting comment failed:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                "Unable to delete comment."
            );
        } finally {
            setDeletingCommentId(null);
        }
    };

    // Load the current user's playlists
    const handleOpenPlaylists = async () => {
        if (!user) {
            toast.error("Please log in to save videos to a playlist.");
            return;
        }

        try {
            setShowPlaylistModal(true);
            setPlaylistsLoading(true);

            const userId = user._id || user.user?._id;

            if (!userId) {
                throw new Error(
                    "User information is unavailable. Please log in again."
                );
            }

            const response = await api.get(
                `/playlists/user/${userId}`
            );

            const data = response.data?.data;

            const userPlaylists = Array.isArray(data)
                ? data
                : data?.playlists || [];

            setPlaylists(userPlaylists);
        } catch (err) {
            console.error(
                "Failed to fetch playlists:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                err.message ||
                "Unable to load playlists."
            );

            setShowPlaylistModal(false);
        } finally {
            setPlaylistsLoading(false);
        }
    };

    // Add the current video to the selected playlist
    const handleAddToPlaylist = async (playlistId) => {
        if (!video?._id || addingPlaylistId) return;

        try {
            setAddingPlaylistId(playlistId);

            await api.post(
                `/playlists/${playlistId}/videos/${video._id}`
            );

            toast.success("Video added to playlist!");
            setShowPlaylistModal(false);
        } catch (err) {
            console.error(
                "Failed to add video to playlist:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                "Unable to add video to playlist."
            );
        } finally {
            setAddingPlaylistId(null);
        }
    };

    // Wait for the video and authentication information
    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] p-6 text-white">
                <p className="animate-pulse text-neutral-400">
                    Loading video...
                </p>
            </div>
        );
    }

    // Display an error if the video could not be loaded
    if (error || !video) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] p-6 text-white">
                <h1 className="text-2xl font-bold">
                    Unable to load video
                </h1>

                <p className="mt-3 text-red-400">
                    {error || "Video not found."}
                </p>

                <Link
                    to="/"
                    className="mt-5 inline-block rounded-full bg-white px-5 py-2 font-semibold text-black hover:bg-neutral-200"
                >
                    Back to Home
                </Link>
            </div>
        );
    }

    const owner =
        video.owner && typeof video.owner === "object"
            ? video.owner
            : {};

    const channelUsername = owner.username;
    const channelName =
        owner.fullName || owner.fullname || owner.username || "Channel";

    const videoUrl =
        typeof video.videoFile === "object"
            ? video.videoFile?.url
            : video.videoFile;

    const thumbnailUrl =
        typeof video.thumbnail === "object"
            ? video.thumbnail?.url
            : video.thumbnail;

    const isOwnChannel =
        currentUserId &&
        owner._id &&
        String(owner._id) === String(currentUserId);

    return (
        <div className="min-h-screen bg-[#0f0f0f] p-4 text-white md:p-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Main video column */}
                <div className="min-w-0 xl:col-span-2">
                    {/* Video player */}
                    <div className="aspect-video overflow-hidden rounded-xl bg-black">
                        {videoUrl ? (
                            <video
                                key={videoUrl}
                                controls
                                autoPlay
                                playsInline
                                preload="metadata"
                                poster={thumbnailUrl || undefined}
                                className="h-full w-full"
                            >
                                <source src={videoUrl} />
                                Your browser does not support video playback.
                            </video>
                        ) : (
                            <div className="flex h-full items-center justify-center text-neutral-400">
                                Video file URL is missing.
                            </div>
                        )}
                    </div>

                    {/* Video title */}
                    <h1 className="mt-4 text-xl font-bold md:text-2xl">
                        {video.title || "Untitled video"}
                    </h1>

                    {/* Channel information and video actions */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex min-w-0 flex-wrap items-center gap-3">
                            {channelUsername ? (
                                <Link
                                    to={`/channel/${encodeURIComponent(channelUsername)}`}
                                    title="View channel"
                                    className="shrink-0"
                                >
                                    {owner.avatar ? (
                                        <img
                                            src={owner.avatar}
                                            alt={channelName}
                                            className="h-11 w-11 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-700">
                                            <UserRound size={22} />
                                        </div>
                                    )}
                                </Link>
                            ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-700">
                                    <UserRound size={22} />
                                </div>
                            )}

                            <div className="min-w-0">
                                {channelUsername ? (
                                    <Link
                                        to={`/channel/${encodeURIComponent(channelUsername)}`}
                                        className="font-semibold hover:text-neutral-300"
                                    >
                                        {channelName}
                                    </Link>
                                ) : (
                                    <p className="font-semibold">
                                        {channelName}
                                    </p>
                                )}

                                <p className="text-sm text-neutral-400">
                                    {subscriberCount.toLocaleString()} subscribers
                                </p>
                            </div>

                            {!isOwnChannel && owner._id && (
                                <button
                                    type="button"
                                    onClick={handleSubscribe}
                                    disabled={subscribing}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                                        isSubscribed
                                            ? "bg-neutral-700 text-white hover:bg-neutral-600"
                                            : "bg-white text-black hover:bg-neutral-200"
                                    }`}
                                >
                                    {subscribing
                                        ? "Please wait..."
                                        : isSubscribed
                                        ? "Subscribed"
                                        : "Subscribe"}
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400">
                            <span className="flex items-center gap-2">
                                <Eye size={18} />
                                {Number(video.views || 0).toLocaleString()} views
                            </span>

                            {video.createdAt && (
                                <span className="flex items-center gap-2">
                                    <Calendar size={17} />
                                    {new Date(video.createdAt).toLocaleDateString()}
                                </span>
                            )}

                            {/* Like button */}
                            <button
                                type="button"
                                onClick={handleLike}
                                disabled={liking}
                                className={`flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition disabled:opacity-50 ${
                                    isLiked
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-[#272727] text-white hover:bg-[#3f3f3f]"
                                }`}
                            >
                                <ThumbsUp size={18} />
                                {likeCount.toLocaleString()}
                                {isLiked ? "Liked" : "Like"}
                            </button>

                            {/* Save button */}
                            <button
                                type="button"
                                onClick={handleOpenPlaylists}
                                className="flex items-center gap-2 rounded-full bg-[#272727] px-4 py-2 font-semibold text-white hover:bg-[#3f3f3f]"
                            >
                                <ListVideo size={18} />
                                Save
                            </button>
                        </div>
                    </div>

                    {/* Video description */}
                    <div className="mt-5 rounded-xl bg-[#272727] p-4">
                        <h2 className="mb-2 font-semibold">
                            Description
                        </h2>

                        <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-300">
                            {video.description || "No description provided."}
                        </p>
                    </div>

                    {/* Comments section */}
                    <section className="mt-8">
                        <div className="mb-5 flex items-center gap-2">
                            <MessageCircle size={22} />

                            <h2 className="text-xl font-semibold">
                                Comments ({comments.length})
                            </h2>
                        </div>

                        {/* Add a comment */}
                        {user ? (
                            <form
                                onSubmit={handleAddComment}
                                className="mb-8 flex gap-3"
                            >
                                {user.avatar || user.user?.avatar ? (
                                    <img
                                        src={user.avatar || user.user?.avatar}
                                        alt="Your avatar"
                                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-700">
                                        <UserRound size={20} />
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) =>
                                            setCommentText(e.target.value)
                                        }
                                        placeholder="Add a comment..."
                                        rows={2}
                                        maxLength={2000}
                                        className="w-full resize-y border-b border-neutral-600 bg-transparent p-2 outline-none focus:border-white"
                                    />

                                    <div className="mt-3 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={
                                                commentSubmitting ||
                                                !commentText.trim()
                                            }
                                            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Send size={16} />
                                            {commentSubmitting
                                                ? "Posting..."
                                                : "Comment"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <p className="mb-6 text-sm text-neutral-400">
                                Please log in to add a comment.
                            </p>
                        )}

                        {/* Display comments */}
                        {commentsLoading ? (
                            <p className="text-neutral-400">
                                Loading comments...
                            </p>
                        ) : comments.length === 0 ? (
                            <p className="text-neutral-400">
                                No comments yet. Be the first to comment!
                            </p>
                        ) : (
                            <div className="space-y-6">
                                {comments.map((comment) => {
                                    const commentOwner =
                                        comment.owner &&
                                        typeof comment.owner === "object"
                                            ? comment.owner
                                            : {};

                                    const ownerId =
                                        commentOwner._id || comment.owner;

                                    const isCommentOwner =
                                        currentUserId &&
                                        ownerId &&
                                        String(currentUserId) ===
                                            String(ownerId);

                                    const isEditing =
                                        editingCommentId === comment._id;

                                    const commenterName =
                                        commentOwner.fullName ||
                                        commentOwner.fullname ||
                                        commentOwner.username ||
                                        "User";

                                    return (
                                        <div
                                            key={comment._id}
                                            className="flex gap-3"
                                        >
                                            {commentOwner.avatar ? (
                                                <img
                                                    src={commentOwner.avatar}
                                                    alt={commenterName}
                                                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-700">
                                                    <UserRound size={20} />
                                                </div>
                                            )}

                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                                    <span className="font-medium">
                                                        {commenterName}
                                                    </span>

                                                    {comment.createdAt && (
                                                        <span className="text-xs text-neutral-400">
                                                            {new Date(
                                                                comment.createdAt
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>

                                                {isEditing ? (
                                                    <div>
                                                        <textarea
                                                            value={editingText}
                                                            onChange={(e) =>
                                                                setEditingText(
                                                                    e.target.value
                                                                )
                                                            }
                                                            rows={2}
                                                            maxLength={2000}
                                                            className="w-full rounded-lg border border-neutral-600 bg-neutral-900 p-3 outline-none focus:border-white"
                                                        />

                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleEditComment(
                                                                        comment._id
                                                                    )
                                                                }
                                                                disabled={
                                                                    savingEdit ||
                                                                    !editingText.trim()
                                                                }
                                                                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                                                            >
                                                                {savingEdit
                                                                    ? "Saving..."
                                                                    : "Save"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingCommentId(
                                                                        null
                                                                    );
                                                                    setEditingText(
                                                                        ""
                                                                    );
                                                                }}
                                                                className="flex items-center gap-1 rounded-full bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700"
                                                            >
                                                                <X size={15} />
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-neutral-200">
                                                        {comment.content}
                                                    </p>
                                                )}

                                                {/* Only the comment owner sees these controls */}
                                                {isCommentOwner && !isEditing && (
                                                    <div className="mt-3 flex gap-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingCommentId(
                                                                    comment._id
                                                                );
                                                                setEditingText(
                                                                    comment.content || ""
                                                                );
                                                            }}
                                                            className="flex items-center gap-1 text-sm text-neutral-400 hover:text-white"
                                                        >
                                                            <Pencil size={14} />
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteComment(
                                                                    comment._id
                                                                )
                                                            }
                                                            disabled={
                                                                deletingCommentId ===
                                                                comment._id
                                                            }
                                                            className="flex items-center gap-1 text-sm text-neutral-400 hover:text-red-400 disabled:opacity-50"
                                                        >
                                                            <Trash2 size={14} />
                                                            {deletingCommentId ===
                                                            comment._id
                                                                ? "Deleting..."
                                                                : "Delete"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>

                {/* Video details sidebar */}
                <aside className="min-w-0">
                    <h2 className="mb-4 text-lg font-bold">
                        Video details
                    </h2>

                    <div className="rounded-xl bg-[#181818] p-4">
                        <p className="text-sm text-neutral-400">
                            Duration
                        </p>

                        <p className="mt-1">
                            {video.duration
                                ? `${Math.floor(video.duration / 60)}:${String(
                                      Math.floor(video.duration % 60)
                                  ).padStart(2, "0")}`
                                : "Not available"}
                        </p>

                        <div className="my-4 border-t border-neutral-700" />

                        <p className="text-sm text-neutral-400">
                            Visibility
                        </p>

                        <p className="mt-1">
                            {video.isPublished
                                ? "Published"
                                : "Unpublished"}
                        </p>
                    </div>
                </aside>
            </div>

            {/* Save-to-playlist modal */}
            {showPlaylistModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-neutral-700 bg-[#181818] p-5 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                                Save to playlist
                            </h2>

                            <button
                                type="button"
                                onClick={() => setShowPlaylistModal(false)}
                                className="rounded-full p-2 hover:bg-neutral-700"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {playlistsLoading ? (
                            <p className="py-6 text-center text-neutral-400">
                                Loading playlists...
                            </p>
                        ) : playlists.length === 0 ? (
                            <div className="py-5 text-center">
                                <ListVideo
                                    size={40}
                                    className="mx-auto mb-3 text-neutral-400"
                                />

                                <p className="font-semibold">
                                    No playlists found
                                </p>

                                <p className="mt-2 text-sm text-neutral-400">
                                    Create a playlist before saving this video.
                                </p>

                                <Link
                                    to="/create-playlist"
                                    onClick={() =>
                                        setShowPlaylistModal(false)
                                    }
                                    className="mt-5 inline-block rounded-full bg-white px-5 py-2 font-semibold text-black hover:bg-neutral-200"
                                >
                                    Create playlist
                                </Link>
                            </div>
                        ) : (
                            <div className="max-h-80 space-y-2 overflow-y-auto">
                                {playlists.map((playlist) => (
                                    <button
                                        key={playlist._id}
                                        type="button"
                                        onClick={() =>
                                            handleAddToPlaylist(playlist._id)
                                        }
                                        disabled={addingPlaylistId !== null}
                                        className="flex w-full items-center gap-3 rounded-lg bg-[#272727] p-3 text-left hover:bg-[#383838] disabled:opacity-50"
                                    >
                                        <ListVideo
                                            size={24}
                                            className="shrink-0 text-neutral-300"
                                        />

                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate font-semibold">
                                                {playlist.name ||
                                                    "Untitled playlist"}
                                            </span>

                                            <span className="text-sm text-neutral-400">
                                                {playlist.videos?.length || 0}{" "}
                                                videos
                                            </span>
                                        </span>

                                        {addingPlaylistId === playlist._id && (
                                            <span className="text-sm text-neutral-400">
                                                Saving...
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default WatchVideo;