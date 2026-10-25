
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import VideoCard from "../components/video/VideoCard";

const Search = () => {
   
 // Get the query parameters from the current URL
const [searchParams] = useSearchParams();

// Get the "search" value from the URL, remove extra spaces,
// and use an empty string if the value is missing
const query = searchParams.get("search")?.trim() || "";

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchVideos = async () => {
        if (!query) {
            setVideos([]);
            setError("");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get("/videos", {
                params: {
                    query: query
                }
            });

            const data = response.data.data;

            const videoList = Array.isArray(data)
                ? data
                : data?.videos || data?.docs || [];

            setVideos(videoList);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load search results. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [query]);

    if (!query) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white px-4 sm:px-8 py-6">
                <h1 className="text-2xl font-bold mb-3">
                    Search videos
                </h1>

                <p className="text-gray-400">
                    Enter a video title or keyword in the search bar.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
                <p className="text-gray-300">
                    Searching for "{query}"...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center gap-4 p-6">
                <p className="text-red-400 text-center">
                    {error}
                </p>

                <button
                    onClick={fetchVideos}
                    className="bg-white text-black px-5 py-2 rounded-full font-medium hover:bg-gray-200"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white px-4 sm:px-8 py-6">
            <h1 className="text-2xl font-bold mb-2">
                Search results
            </h1>

            <p className="text-gray-400 mb-8">
                Results for "{query}" · {videos.length} videos
            </p>

            {videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-6xl mb-5">
                        🔍
                    </div>

                    <h2 className="text-xl font-semibold mb-2">
                        No videos found
                    </h2>

                    <p className="text-gray-400">
                        Try different keywords or check your spelling.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                    {videos.map((video) => (
                        <VideoCard
                            key={video._id}
                            video={video}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Search;
