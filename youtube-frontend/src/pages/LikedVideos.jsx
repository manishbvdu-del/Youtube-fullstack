
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const LikedVideos = () => {
    const navigate = useNavigate();

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [unlikingId, setUnlikingId] = useState(null);

    const fetchLikedVideos = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/likes/videos");

            const data = response.data.data;
            setVideos(Array.isArray(data) ? data : data?.videos || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load liked videos."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLikedVideos();
    }, []);

    const handleUnlike = async (videoId) => {
        if (unlikingId) return;

        try {
            setUnlikingId(videoId);

            await api.post(`/likes/toggle/v/${videoId}`);

            setVideos((previousVideos) =>
                previousVideos.filter((video) => video._id !== videoId)
            );
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to unlike this video."
            );
        } finally {
            setUnlikingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
                Loading liked videos...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center gap-4 p-6">
                <p className="text-red-400 text-center">{error}</p>

                <button
                    onClick={fetchLikedVideos}
                    className="bg-white text-black px-5 py-2 rounded-full"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white px-4 sm:px-8 py-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Liked Videos</h1>

                <p className="text-gray-400 mt-2">
                    {videos.length} video(s) you liked
                </p>
            </div>

            {videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-6xl mb-5">👍</div>

                    <h2 className="text-xl font-semibold mb-2">
                        No liked videos yet
                    </h2>

                    <p className="text-gray-400 mb-5">
                        Videos you like will appear here.
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
                            className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl hover:bg-[#181818]"
                        >
                            <img
                                src={
                                    video.thumbnail ||
                                    "https://placehold.co/640x360?text=Video"
                                }
                                alt={video.title || "Video thumbnail"}
                                onClick={() =>
                                    navigate(`/video/${video._id}`)
                                }
                                className="w-full sm:w-64 aspect-video object-cover rounded-lg cursor-pointer"
                            />

                            <div className="flex-1">
                                <h2
                                    onClick={() =>
                                        navigate(`/video/${video._id}`)
                                    }
                                    className="font-semibold text-lg cursor-pointer hover:text-gray-300"
                                >
                                    {video.title || "Untitled video"}
                                </h2>

                                <p className="text-gray-400 text-sm mt-2">
                                    {Number(video.views || 0).toLocaleString()} views
                                </p>

                                <p className="text-gray-400 text-sm mt-3 line-clamp-2">
                                    {video.description || "No description available"}
                                </p>

                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={() =>
                                            navigate(`/video/${video._id}`)
                                        }
                                        className="bg-[#272727] hover:bg-[#3f3f3f] px-4 py-2 rounded-full text-sm"
                                    >
                                        Watch Video
                                    </button>

                                    <button
                                        onClick={() => handleUnlike(video._id)}
                                        disabled={unlikingId === video._id}
                                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 py-2 rounded-full text-sm"
                                    >
                                        {unlikingId === video._id
                                            ? "Please wait..."
                                            : "Unlike"}
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

export default LikedVideos;
