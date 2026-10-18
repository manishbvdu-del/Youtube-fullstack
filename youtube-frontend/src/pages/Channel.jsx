
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const Channel = () => {
  const { username } = useParams();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState("");

  const fetchChannel = async () => {
    const response = await api.get(
      `/users/c/${encodeURIComponent(username)}`
    );

    const channelData = response.data.data;

    setChannel(channelData);
    setIsSubscribed(channelData.isSubscribed ?? false);

    return channelData;
  };

  const fetchVideos = async (channelId) => {
    const response = await api.get("/videos", {
      params: {
        userId: channelId,
        limit: 20
      }
    });

    const result = response.data.data;

    setVideos(
      Array.isArray(result)
        ? result
        : result?.videos ?? []
    );
  };

  const handleSubscribe = async () => {
    if (!channel || subscribing) return;

    try {
      setSubscribing(true);

      const response = await api.post(
        `/subscriptions/c/${channel._id}`
      );

      const subscribed = response.data.data.subscribed;

      setIsSubscribed(subscribed);

      // Refresh channel details to update subscriber count.
      const profileResponse = await api.get(
        `/users/c/${encodeURIComponent(username)}`
      );

      const updatedChannel = profileResponse.data.data;

      setChannel(updatedChannel);
      setIsSubscribed(updatedChannel.isSubscribed ?? subscribed);
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to update subscription. Please log in."
      );
    } finally {
      setSubscribing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadChannel = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/users/c/${encodeURIComponent(username)}`
        );

        if (cancelled) return;

        const channelData = response.data.data;

        setChannel(channelData);
        setIsSubscribed(channelData.isSubscribed ?? false);

        const videoResponse = await api.get("/videos", {
          params: {
            userId: channelData._id,
            limit: 20
          }
        });

        if (cancelled) return;

        const result = videoResponse.data.data;

        setVideos(
          Array.isArray(result)
            ? result
            : result?.videos ?? []
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            "Unable to load channel"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (username) {
      loadChannel();
    }

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        Loading channel...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-400 p-6">
        {error}
      </div>
    );
  }

  if (!channel) return null;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Channel Banner */}
      <img
        src={channel.coverImage || "https://placehold.co/1200x300"}
        alt="Channel banner"
        className="w-full h-40 md:h-60 object-cover rounded-xl"
      />

      {/* Channel Details */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mt-6">
        <img
          src={channel.avatar || "https://placehold.co/120x120"}
          alt="Channel avatar"
          className="w-24 h-24 rounded-full object-cover"
        />

        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold">
            {channel.fullname}
          </h1>

          <p className="text-gray-400">
            @{channel.username}
          </p>

          <p className="text-gray-400 mt-1">
            {channel.subscriberCount ?? 0} subscribers
          </p>

          <p className="text-gray-400 text-sm mt-1">
            {channel.channelsSubscribedToCount ?? 0} subscriptions
          </p>

          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className={`mt-3 px-5 py-2 rounded-full font-semibold disabled:opacity-50 ${
              isSubscribed
                ? "bg-gray-700 text-white"
                : "bg-white text-black"
            }`}
          >
            {subscribing
              ? "Please wait..."
              : isSubscribed
                ? "Subscribed"
                : "Subscribe"}
          </button>
        </div>
      </div>

      {/* Videos Section */}
      <h2 className="text-xl font-bold mt-8 mb-4">
        Videos
      </h2>

      {videos.length === 0 ? (
        <p className="text-gray-400">
          No videos uploaded yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {videos.map((video) => (
            <div key={video._id}>
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full aspect-video object-cover rounded-xl"
              />

              <h3 className="mt-2 font-semibold">
                {video.title}
              </h3>

              <p className="text-sm text-gray-400">
                {video.views} views
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Channel;
