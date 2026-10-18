
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const History = () => {
    const navigate = useNavigate();

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/users/history");

            const data = response.data.data;
            setVideos(Array.isArray(data) ? data : data?.watchHistory || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load watch history. Please log in."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const clearHistory = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to clear your watch history?"
        );

        if (!confirmed) return;

        try {
            // Add this endpoint to your backend if it does not exist.
            await api.delete("/users/history");

            setVideos([]);
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to clear watch history."
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
                Loading watch history...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center gap-4 p-6">
                <p className="text-red-400 text-center">{error}</p>

                <button
                    onClick={fetchHistory}
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
                    <h1 className="text-2xl font-bold">Watch History</h1>

                    <p className="text-gray-400 mt-2">
                        {videos.length} video(s) in your history
                    </p>
                </div>

                {videos.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="bg-[#272727] hover:bg-[#3f3f3f] px-5 py-2 rounded-full text-sm font-medium"
                    >
                        Clear History
                    </button>
                )}
            </div>

            {videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-6xl mb-5">🕘</div>

                    <h2 className="text-xl font-semibold mb-2">
                        Your watch history is empty
                    </h2>

                    <p className="text-gray-400 mb-5">
                        Videos you watch will appear here.
                    </p>

                    <button
                        onClick={() => navigate("/")}
                        className="bg-white text-black px-5 py-2 rounded-full font-medium hover:bg-gray-200"
                    >
                        Explore Videos
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {videos.map((video) => (
                        <div
                            key={video._id}
                            onClick={() => navigate(`/video/${video._id}`)}
                            className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl hover:bg-[#181818] cursor-pointer"
                        >
                            <img
                                src={
                                    video.thumbnail ||
                                    "https://placehold.co/640x360?text=Video"
                                }
                                alt={video.title || "Video thumbnail"}
                                className="w-full sm:w-64 aspect-video object-cover rounded-lg"
                            />

                            <div className="flex-1">
                                <h2 className="font-semibold text-lg line-clamp-2">
                                    {video.title || "Untitled video"}
                                </h2>

                                <p className="text-gray-400 text-sm mt-2">
                                    {Number(video.views || 0).toLocaleString()} views
                                </p>

                                <p className="text-gray-400 text-sm mt-3 line-clamp-2">
                                    {video.description || "No description available"}
                                </p>

                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        navigate(`/video/${video._id}`);
                                    }}
                                    className="mt-4 bg-[#272727] hover:bg-[#3f3f3f] px-4 py-2 rounded-full text-sm"
                                >
                                    Watch Again
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
