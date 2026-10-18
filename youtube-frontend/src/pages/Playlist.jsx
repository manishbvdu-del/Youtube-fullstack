
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Playlist = () => {
    const navigate = useNavigate();

    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            setError("");

            const userResponse = await api.get("/users/current-user");
            const user = userResponse.data.data;

            const response = await api.get(
                `/playlists/user/${user._id}`
            );

            const data = response.data.data;
            setPlaylists(Array.isArray(data) ? data : data?.playlists || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load playlists. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const handleDelete = async (playlistId) => {
        if (!window.confirm("Are you sure you want to delete this playlist?")) {
            return;
        }

        try {
            setDeletingId(playlistId);

            await api.delete(`/playlists/${playlistId}`);

            setPlaylists((previous) =>
                previous.filter((playlist) => playlist._id !== playlistId)
            );
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to delete playlist."
            );
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
                Loading playlists...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center gap-4 p-6">
                <p className="text-red-400 text-center">{error}</p>
                <button
                    onClick={fetchPlaylists}
                    className="bg-white text-black px-5 py-2 rounded-full"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white px-4 sm:px-8 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Your playlists</h1>
                    <p className="text-gray-400 mt-2">
                        {playlists.length} playlist(s)
                    </p>
                </div>

                <button
                    onClick={() => navigate("/create-playlist")}
                    className="bg-white text-black px-5 py-2 rounded-full font-medium hover:bg-gray-200"
                >
                    + Create playlist
                </button>
            </div>

            {playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-6xl mb-5">📂</div>

                    <h2 className="text-xl font-semibold mb-2">
                        No playlists yet
                    </h2>

                    <p className="text-gray-400 mb-5">
                        Create a playlist to organize your favorite videos.
                    </p>

                    <button
                        onClick={() => navigate("/create-playlist")}
                        className="bg-white text-black px-5 py-2 rounded-full font-medium hover:bg-gray-200"
                    >
                        Create your first playlist
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {playlists.map((playlist) => (
                        <div
                            key={playlist._id}
                            className="bg-[#181818] rounded-xl overflow-hidden hover:bg-[#222222] transition"
                        >
                            <div
                                onClick={() =>
                                    navigate(`/playlist/${playlist._id}`)
                                }
                                className="h-40 bg-[#272727] flex flex-col items-center justify-center cursor-pointer"
                            >
                                <span className="text-5xl">▶</span>
                                <p className="text-sm text-gray-300 mt-3">
                                    View playlist
                                </p>
                            </div>

                            <div className="p-4">
                                <h2 className="text-lg font-semibold truncate">
                                    {playlist.name || "Untitled playlist"}
                                </h2>

                                <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                                    {playlist.description ||
                                        playlist.desscription ||
                                        "No description available"}
                                </p>

                                <p className="text-gray-500 text-sm mt-3">
                                    {playlist.videos?.length || 0} videos
                                </p>

                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() =>
                                            navigate(`/playlist/${playlist._id}`)
                                        }
                                        className="flex-1 bg-[#303030] hover:bg-[#414141] py-2 rounded-full text-sm"
                                    >
                                        Open
                                    </button>

                                    <button
                                        onClick={() => handleDelete(playlist._id)}
                                        disabled={deletingId === playlist._id}
                                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 py-2 rounded-full text-sm"
                                    >
                                        {deletingId === playlist._id
                                            ? "Deleting..."
                                            : "Delete"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Playlist;
