
import { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { UserRound, Eye, Calendar, ListVideo, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function WatchVideo() {
    const { videoId } = useParams();
    const { user, loading: authLoading } = useContext(AuthContext);

    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [subscribing, setSubscribing] = useState(false);

    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [playlistsLoading, setPlaylistsLoading] = useState(false);
    const [addingPlaylistId, setAddingPlaylistId] = useState(null);

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

    const handleSubscribe = async () => {
        if (!user) {
            toast.error("Please log in to subscribe.");
            return;
        }

        if (!video?.owner?._id) {
            toast.error("Channel information is unavailable.");
            return;
        }

        if (String(video.owner._id) === String(user._id)) {
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
                toast.error(
                    "Subscription response is unexpected. Check your backend controller."
                );
                return;
            }

            const subscribed = result.subscribed;

            setIsSubscribed(subscribed);

            setSubscriberCount((count) =>
                Math.max(0, count + (subscribed ? 1 : -1))
            );

            toast.success(
                subscribed
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
                "Unable to update subscription. Please log in again."
            );
        } finally {
            setSubscribing(false);
        }
    };

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
                throw new Error("User information is unavailable. Please log in again.");
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

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] p-6 text-white">
                <p className="animate-pulse text-neutral-400">
                    Loading video...
                </p>
            </div>
        );
    }

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
        owner.fullname || owner.username || "Channel";

    const videoUrl =
        typeof video.videoFile === "object"
            ? video.videoFile?.url
            : video.videoFile;

    const thumbnailUrl =
        typeof video.thumbnail === "object"
            ? video.thumbnail?.url
            : video.thumbnail;

    const isOwnChannel =
        user && owner._id &&
        String(owner._id) === String(user._id);

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="min-w-0 xl:col-span-2">
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

                    <h1 className="mt-4 text-xl font-bold md:text-2xl">
                        {video.title || "Untitled video"}
                    </h1>

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

                    <div className="mt-5 rounded-xl bg-[#272727] p-4">
                        <h2 className="mb-2 font-semibold">
                            Description
                        </h2>

                        <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-300">
                            {video.description || "No description provided."}
                        </p>
                    </div>
                </div>

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
                                    onClick={() => setShowPlaylistModal(false)}
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
                                                {playlist.name || "Untitled playlist"}
                                            </span>

                                            <span className="text-sm text-neutral-400">
                                                {playlist.videos?.length || 0} videos
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
