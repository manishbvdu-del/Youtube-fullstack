import { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import {
    UserRound,
    Eye,
    Calendar,
    ListVideo,
    X,
    ThumbsUp,
    AlertCircle,
    LoaderCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Comments from "./Comment";

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
                    videoData.isSubscribed ?? owner.isSubscribed ?? false
                );
                setSubscriberCount(
                    Number(videoData.subscriberCount ?? owner.subscriberCount ?? 0)
                );
                setLikeCount(
                    Number(videoData.likeCount ?? videoData.likesCount ?? 0)
                );
                setIsLiked(Boolean(videoData.isLiked ?? videoData.liked ?? false));
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
                if (!cancelled) setLoading(false);
            }
        };

        if (!videoId) {
            setError("Video ID is missing.");
            setLoading(false);
        } else {
            fetchVideo();
        }

        return () => {
            cancelled = true;
        };
    }, [videoId]);

    // Like or unlike the video
    const handleLike = async () => {
        if (!user) {
            toast.error("Please log in to like this video.");
            return;
        }
        if (!video?._id || liking) return;

        try {
            setLiking(true);
            const response = await api.post(`/likes/toggle/v/${video._id}`);
            const data = response.data?.data;

            if (typeof data?.liked !== "boolean") {
                toast.error("Unexpected response from the server.");
                return;
            }

            setIsLiked(data.liked);
            setLikeCount((count) => Math.max(0, count + (data.liked ? 1 : -1)));
            toast.success(data.liked ? "Video liked!" : "Video unliked!");
        } catch (err) {
            console.error("Like request failed:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Unable to update like.");
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

        const ownerId = video?.owner?._id || video?.owner;
        if (!ownerId) {
            toast.error("Channel information is unavailable.");
            return;
        }
        if (String(ownerId) === String(currentUserId)) {
            toast.error("You cannot subscribe to your own channel.");
            return;
        }
        if (subscribing) return;

        try {
            setSubscribing(true);
            const response = await api.post(`/subscriptions/c/${ownerId}`);
            const result = response.data?.data;

            // Supports common response keys used by subscription controllers.
            const subscribed = result?.subscribed ?? result?.isSubscribed;
            if (typeof subscribed !== "boolean") {
                toast.error("Unexpected subscription response. Check your backend response.");
                return;
            }

            setIsSubscribed(subscribed);
            setSubscriberCount((count) =>
                Math.max(0, count + (subscribed ? 1 : -1))
            );
            toast.success(subscribed ? "Subscribed successfully!" : "Unsubscribed successfully!");
        } catch (err) {
            console.error("Subscription request failed:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Unable to update subscription.");
        } finally {
            setSubscribing(false);
        }
    };

    // Fetch current user's playlists and open the modal
    const handleOpenPlaylists = async () => {
        if (!user || !currentUserId) {
            toast.error("Please log in to save videos to a playlist.");
            return;
        }

        setShowPlaylistModal(true);
        setPlaylistsLoading(true);

        try {
            const response = await api.get(`/playlists/user/${currentUserId}`);
            const result = response.data?.data;
            const list = Array.isArray(result)
                ? result
                : result?.playlists ?? result?.docs ?? [];
            setPlaylists(list);
        } catch (err) {
            console.error("Failed to load playlists:", err.response?.data || err.message);
            setPlaylists([]);
            toast.error(err.response?.data?.message || "Unable to load playlists.");
        } finally {
            setPlaylistsLoading(false);
        }
    };

    // Add this video to the selected playlist
    const handleAddToPlaylist = async (playlistId) => {
        if (!video?._id || !playlistId || addingPlaylistId) return;

        try {
            setAddingPlaylistId(playlistId);
            // Expected backend route: PATCH /playlists/add/:videoId/:playlistId
            await api.patch(`/playlists/add/${video._id}/${playlistId}`);
            toast.success("Video added to playlist!");
            setPlaylists((items) =>
                items.map((playlist) =>
                    playlist._id === playlistId
                        ? {
                              ...playlist,
                              videos: Array.isArray(playlist.videos)
                                  ? [...playlist.videos, video._id]
                                  : [video._id],
                          }
                        : playlist
                )
            );
            setShowPlaylistModal(false);
        } catch (err) {
            console.error("Failed to add video to playlist:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Unable to save video to playlist.");
        } finally {
            setAddingPlaylistId(null);
        }
    };

    if (authLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-[#0f0f0f] text-white">
                <LoaderCircle className="mr-2 animate-spin" size={22} />
                Checking your account...
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-[#0f0f0f] text-white">
                <LoaderCircle className="mr-2 animate-spin" size={22} />
                Loading video...
            </div>
        );
    }

    if (error || !video) {
        return (
            <div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center gap-3 bg-[#0f0f0f] px-4 text-center text-white">
                <AlertCircle size={36} className="text-red-400" />
                <h1 className="text-xl font-bold">Unable to open video</h1>
                <p className="text-neutral-400">{error || "Video not found."}</p>
                <Link to="/" className="mt-2 rounded-full bg-white px-5 py-2 font-semibold text-black hover:bg-neutral-200">
                    Back to Home
                </Link>
            </div>
        );
    }

    const owner = typeof video.owner === "object" && video.owner !== null ? video.owner : {};
    const channelName = owner.fullName || owner.username || "Unknown channel";
    const channelUsername = owner.username;
    const ownerId = owner._id || (typeof video.owner === "string" ? video.owner : "");
    const isOwnChannel = Boolean(currentUserId && ownerId && String(currentUserId) === String(ownerId));
    const videoSrc = video.videoFile?.url || video.videoFile || video.videoUrl || video.url;

    return (
        <div className="min-h-screen bg-[#0f0f0f] px-4 py-5 text-white md:px-6">
            <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0">
                    {/* Video player */}
                    <div className="aspect-video overflow-hidden rounded-xl bg-black">
                        {videoSrc ? (
                            <video
                                key={videoSrc}
                                className="h-full w-full"
                                controls
                                playsInline
                                preload="metadata"
                                poster={video.thumbnail?.url || video.thumbnail || video.thumbnailUrl || undefined}
                            >
                                <source src={videoSrc} type="video/mp4" />
                                Your browser does not support HTML video.
                            </video>
                        ) : (
                            <div className="flex h-full min-h-48 items-center justify-center text-neutral-400">
                                Video source is not available.
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
                                <Link to={`/channel/${encodeURIComponent(channelUsername)}`} title="View channel" className="shrink-0">
                                    {owner.avatar?.url || owner.avatar ? (
                                        <img
                                            src={owner.avatar?.url || owner.avatar}
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
                                    <Link to={`/channel/${encodeURIComponent(channelUsername)}`} className="font-semibold hover:text-neutral-300">
                                        {channelName}
                                    </Link>
                                ) : (
                                    <p className="font-semibold">{channelName}</p>
                                )}
                                <p className="text-sm text-neutral-400">
                                    {subscriberCount.toLocaleString()} subscribers
                                </p>
                            </div>

                            {!isOwnChannel && ownerId && (
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
                                    {subscribing ? "Please wait..." : isSubscribed ? "Subscribed" : "Subscribe"}
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
                                {likeCount.toLocaleString()} {isLiked ? "Liked" : "Like"}
                            </button>
                            <button
                                type="button"
                                onClick={handleOpenPlaylists}
                                className="flex items-center gap-2 rounded-full bg-[#272727] px-4 py-2 font-semibold text-white hover:bg-[#3f3f3f]"
                            >
                                <ListVideo size={18} /> Save
                            </button>
                        </div>
                    </div>

                    {/* Video description */}
                    <div className="mt-5 rounded-xl bg-[#272727] p-4">
                        <h2 className="mb-2 font-semibold">Description</h2>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-300">
                            {video.description || "No description provided."}
                        </p>
                    </div>

                    {/* Comments section */}
                    <Comments videoId={videoId} user={user} currentUserId={currentUserId} />
                </div>

                {/* Video details sidebar */}
                <aside className="min-w-0">
                    <h2 className="mb-4 text-lg font-bold">Video details</h2>
                    <div className="rounded-xl bg-[#181818] p-4">
                        <p className="text-sm text-neutral-400">Duration</p>
                        <p className="mt-1">
                            {Number(video.duration) > 0
                                ? `${Math.floor(Number(video.duration) / 60)}:${String(Math.floor(Number(video.duration) % 60)).padStart(2, "0")}`
                                : "Not available"}
                        </p>
                        <div className="my-4 border-t border-neutral-700" />
                        <p className="text-sm text-neutral-400">Visibility</p>
                        <p className="mt-1">{video.isPublished ? "Published" : "Unpublished"}</p>
                    </div>
                </aside>
            </div>

            {/* Save-to-playlist modal */}
            {showPlaylistModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowPlaylistModal(false)}>
                    <div className="w-full max-w-md rounded-2xl border border-neutral-700 bg-[#181818] p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Save to playlist</h2>
                            <button type="button" onClick={() => setShowPlaylistModal(false)} className="rounded-full p-2 hover:bg-neutral-700" aria-label="Close">
                                <X size={20} />
                            </button>
                        </div>

                        {playlistsLoading ? (
                            <p className="py-6 text-center text-neutral-400">Loading playlists...</p>
                        ) : playlists.length === 0 ? (
                            <div className="py-5 text-center">
                                <ListVideo size={40} className="mx-auto mb-3 text-neutral-400" />
                                <p className="font-semibold">No playlists found</p>
                                <p className="mt-2 text-sm text-neutral-400">Create a playlist before saving this video.</p>
                                <Link to="/playlists" onClick={() => setShowPlaylistModal(false)} className="mt-5 inline-block rounded-full bg-white px-5 py-2 font-semibold text-black hover:bg-neutral-200">
                                    View playlists
                                </Link>
                            </div>
                        ) : (
                            <div className="max-h-80 space-y-2 overflow-y-auto">
                                {playlists.map((playlist) => (
                                    <button
                                        key={playlist._id}
                                        type="button"
                                        onClick={() => handleAddToPlaylist(playlist._id)}
                                        disabled={addingPlaylistId !== null}
                                        className="flex w-full items-center gap-3 rounded-lg bg-[#272727] p-3 text-left hover:bg-[#383838] disabled:opacity-50"
                                    >
                                        <ListVideo size={24} className="shrink-0 text-neutral-300" />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate font-semibold">{playlist.name || "Untitled playlist"}</span>
                                            <span className="text-sm text-neutral-400">{playlist.videos?.length || 0} videos</span>
                                        </span>
                                        {addingPlaylistId === playlist._id && (
                                            <span className="text-sm text-neutral-400">Saving...</span>
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
