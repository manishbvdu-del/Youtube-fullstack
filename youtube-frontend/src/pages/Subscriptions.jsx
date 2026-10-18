
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Subscription = () => {
    const navigate = useNavigate();

    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [unsubscribingId, setUnsubscribingId] = useState(null);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            setError("");

            // Get logged-in user
            const userResponse = await api.get("/users/current-user");
            const user = userResponse.data.data;

            // Get channels subscribed to by this user
            const response = await api.get(
                `/subscriptions/u/${user._id}`
            );

            setChannels(response.data.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load subscriptions. Please log in again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const handleUnsubscribe = async (channelId) => {
        if (unsubscribingId) return;

        try {
            setUnsubscribingId(channelId);

            await api.post(`/subscriptions/c/${channelId}`);

            setChannels((previousChannels) =>
                previousChannels.filter(
                    (item) => item.channel?._id !== channelId
                )
            );
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to unsubscribe. Please try again."
            );
        } finally {
            setUnsubscribingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
                Loading subscriptions...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center gap-4 p-6">
                <p className="text-red-400 text-center">{error}</p>
                <button
                    onClick={fetchSubscriptions}
                    className="bg-white text-black px-5 py-2 rounded-full font-medium"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white px-4 sm:px-8 py-6">
            <h1 className="text-2xl font-bold mb-2">
                All subscriptions
            </h1>

            <p className="text-gray-400 mb-8">
                Channels you have subscribed to: {channels.length}
            </p>

            {channels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-6xl mb-5">📺</div>
                    <h2 className="text-xl font-semibold mb-2">
                        No subscriptions yet
                    </h2>
                    <p className="text-gray-400 mb-5">
                        Subscribe to your favorite channels to see them here.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-white text-black px-5 py-2 rounded-full font-medium hover:bg-gray-200"
                    >
                        Explore videos
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {channels.map((item) => {
                        const channel = item.channel;

                        if (!channel) return null;

                        return (
                            <div
                                key={item._id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5"
                            >
                                <div
                                    onClick={() =>
                                        navigate(`/channel/${channel.username}`)
                                    }
                                    className="flex items-center gap-4 cursor-pointer min-w-0"
                                >
                                    <img
                                        src={
                                            channel.avatar ||
                                            "https://placehold.co/100x100?text=User"
                                        }
                                        alt={channel.username}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />

                                    <div className="min-w-0">
                                        <h2 className="font-semibold text-lg truncate">
                                            {channel.fullname || channel.username}
                                        </h2>
                                        <p className="text-gray-400 text-sm">
                                            @{channel.username}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() =>
                                            navigate(`/channel/${channel.username}`)
                                        }
                                        className="bg-[#272727] hover:bg-[#3f3f3f] px-4 py-2 rounded-full text-sm font-medium"
                                    >
                                        View channel
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleUnsubscribe(channel._id)
                                        }
                                        disabled={unsubscribingId === channel._id}
                                        className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 px-4 py-2 rounded-full text-sm font-medium"
                                    >
                                        {unsubscribingId === channel._id
                                            ? "Please wait..."
                                            : "Unsubscribe"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Subscription;
