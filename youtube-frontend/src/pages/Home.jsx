
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import VideoCard from "../components/VideoCard";

function Home() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchParams] = useSearchParams();

    const query = searchParams.get("search") || "";

    useEffect(() => {
        let cancelled = false;

        async function fetchVideos() {
            setLoading(true);
            setError("");

            try {
                const response = await api.get("/videos", {
                    params: query ? { query } : {}
                });

                const data = response.data.data;
                const list = Array.isArray(data)
                    ? data
                    : data?.videos ?? data?.docs ?? [];

                if (!cancelled) {
                    setVideos(list);
                }
            } catch (err) {
                console.error("Fetch videos error:", err);

                if (!cancelled) {
                    setError(
                        "Could not load videos. Check your backend and API route."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchVideos();

        return () => {
            cancelled = true;
        };
    }, [query]);

    return (
        <section>
            <h1 className="mb-6 text-xl font-bold md:text-2xl">
                {query ? `Search results: ${query}` : "Recommended videos"}
            </h1>

            {loading && (
                <p className="text-neutral-400">Loading videos...</p>
            )}

            {!loading && error && (
                <p className="text-red-400">{error}</p>
            )}

            {!loading && !error && videos.length === 0 && (
                <p className="text-neutral-400">No videos found.</p>
            )}

            {!loading && !error && videos.length > 0 && (
                <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            )}
        </section>
    );
}

export default Home;
