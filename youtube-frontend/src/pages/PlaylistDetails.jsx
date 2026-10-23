
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import api from "../api/axios";

function PlaylistDetails() {
    const { playlistId } = useParams();
    const navigate = useNavigate();

    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchPlaylist = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `/playlists/${playlistId}`
                );

                if (cancelled) return;

                setPlaylist(response.data?.data);
            } catch (err) {
                console.error(
                    "Failed to fetch playlist:",
                    err.response?.data || err.message
                );

                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load playlist."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        if (playlistId) {
            fetchPlaylist();
        }

        return () => {
            cancelled = true;
        };
    }, [playlistId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white p-6">
                Loading playlist...
            </div>
        );
    }

    if (error || !playlist) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white p-6">
                <p className="text-red-400">
                    {error || "Playlist not found."}
                </p>

                <Link to="/playlists" className="mt-4 inline-block">
                    Back to playlists
                </Link>
            </div>
        );
    }

    const videos = playlist.videos || [];

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white p-4 sm:p-8">
            <button
                onClick={() => navigate("/playlists")}
                className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white"
            >
                <ArrowLeft size={20} />
                Back to playlists
            </button>

            <h1 className="text-3xl font-bold">
                {playlist.name || "Untitled playlist"}
            </h1>

            <p className="mt-2 text-gray-400">
                {playlist.description || "No description"}
            </p>

            <p className="mt-3 text-sm text-gray-400">
                {videos.length} videos
            </p>

            {videos.length === 0 ? (
                <p className="mt-10 text-gray-400">
                    No videos in this playlist yet.
                </p>
            ) : (
                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {videos.map((video) => (
                        <button
                            key={video._id}
                            type="button"
                            onClick={() =>
                                navigate(`/watch/${video._id}`)
                            }
                            className="overflow-hidden rounded-xl bg-[#181818] text-left transition hover:bg-[#272727]"
                        >
                            <div className="relative aspect-video bg-[#303030]">
                                {video.thumbnail ? (
                                    <img
                                        src={
                                            typeof video.thumbnail === "object"
                                                ? video.thumbnail.url
                                                : video.thumbnail
                                        }
                                        alt={video.title || "Video thumbnail"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <Play size={36} />
                                    </div>
                                )}

                                {video.duration > 0 && (
                                    <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs">
                                        {Math.floor(video.duration / 60)}:
                                        {String(
                                            Math.floor(video.duration % 60)
                                        ).padStart(2, "0")}
                                    </span>
                                )}
                            </div>

                            <div className="p-4">
                                <h2 className="font-semibold">
                                    {video.title || "Untitled video"}
                                </h2>

                                <p className="mt-2 text-sm text-gray-400">
                                    {Number(video.views || 0).toLocaleString()} views
                                </p>

                                <span className="mt-3 inline-flex items-center gap-2 text-sm text-red-400">
                                    <Play size={16} />
                                    Play video
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PlaylistDetails;
