
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [stats, setStats] = useState({
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalSubscribers: 0
    });

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const userResponse = await api.get("/users/current-user");
            const currentUser = userResponse.data.data;

            const [statsResponse, videosResponse] = await Promise.all([
                api.get(`/dashboard/stats/${currentUser._id}`),
                api.get(`/dashboard/videos/${currentUser._id}`)
            ]);

            setStats(statsResponse.data.data);
            setVideos(videosResponse.data.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const statCards = [
        {
            title: "Total Videos",
            value: stats.totalVideos,
            icon: "🎬"
        },
        {
            title: "Total Views",
            value: stats.totalViews,
            icon: "👁️"
        },
        {
            title: "Total Likes",
            value: stats.totalLikes,
            icon: "👍"
        },
        {
            title: "Total Comments",
            value: stats.totalComments,
            icon: "💬"
        },
        {
            title: "Subscribers",
            value: stats.totalSubscribers,
            icon: "👥"
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center gap-4 p-6">
                <p className="text-red-400 text-center">{error}</p>

                <button
                    onClick={fetchDashboard}
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
                    <h1 className="text-3xl font-bold">
                        Channel Dashboard
                    </h1>

                    <p className="text-gray-400 mt-2">
                        Welcome back, {user?.fullname || user?.username || "Creator"}
                    </p>
                </div>

                <button
                    onClick={() => navigate("/upload")}
                    className="bg-white text-black px-5 py-3 rounded-full font-semibold hover:bg-gray-200"
                >
                    + Upload Video
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-10">
                {statCards.map((stat) => (
                    <div
                        key={stat.title}
                        className="bg-[#181818] border border-gray-800 rounded-xl p-5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-gray-400 text-sm">
                                {stat.title}
                            </p>

                            <span className="text-2xl">
                                {stat.icon}
                            </span>
                        </div>

                        <h2 className="text-3xl font-bold">
                            {Number(stat.value || 0).toLocaleString()}
                        </h2>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <h2 className="text-xl font-bold">
                    Your Uploaded Videos
                </h2>

                <button
                    onClick={() => navigate("/")}
                    className="text-gray-300 hover:text-white"
                >
                    Explore Videos →
                </button>
            </div>

            {videos.length === 0 ? (
                <div className="bg-[#181818] rounded-xl p-10 text-center">
                    <div className="text-5xl mb-4">🎬</div>

                    <h3 className="text-xl font-semibold mb-2">
                        No videos uploaded yet
                    </h3>

                    <p className="text-gray-400 mb-5">
                        Upload your first video to start building your channel.
                    </p>

                    <button
                        onClick={() => navigate("/upload")}
                        className="bg-white text-black px-5 py-2 rounded-full font-medium"
                    >
                        Upload Video
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <div
                            key={video._id}
                            className="bg-[#181818] rounded-xl overflow-hidden border border-gray-800"
                        >
                            <img
                                src={
                                    video.thumbnail ||
                                    "https://placehold.co/640x360?text=Video"
                                }
                                alt={video.title}
                                className="w-full aspect-video object-cover"
                            />

                            <div className="p-4">
                                <h3 className="font-semibold text-lg line-clamp-2">
                                    {video.title}
                                </h3>

                                <p className="text-gray-400 text-sm mt-2">
                                    {Number(video.views || 0).toLocaleString()} views
                                </p>

                                <p className="text-gray-500 text-sm mt-1">
                                    {video.isPublished
                                        ? "Published"
                                        : "Unpublished"}
                                </p>

                                <button
                                    onClick={() => navigate(`/video/${video._id}`)}
                                    className="mt-4 bg-[#303030] hover:bg-[#414141] px-4 py-2 rounded-full text-sm"
                                >
                                    View Video
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
