
import { useEffect, useState, useContext } from "react";
import { MessageCircle, Pencil, Trash2, Send, ThumbsUp } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function Tweets() {
    const { user } = useContext(AuthContext);

    const [tweets, setTweets] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    const [likedTweets, setLikedTweets] = useState({});
    const [likeCounts, setLikeCounts] = useState({});
    const [likingId, setLikingId] = useState(null);

    const userId = user?._id || user?.user?._id;

    // Fetch all tweets
    const fetchTweets = async () => {
        try {
            const response = await api.get("/tweets");
            const data = response.data?.data;

            const list = Array.isArray(data) ? data : [];
            setTweets(list);

            // Fetch like information for each tweet when logged in
            if (userId) {
                const results = await Promise.all(
                    list.map(async (tweet) => {
                        try {
                            const res = await api.get(
                                `/likes/tweet/${tweet._id}`
                            );

                            return {
                                id: tweet._id,
                                liked: Boolean(res.data?.data?.isLiked),
                                count: Number(res.data?.data?.likeCount || 0)
                            };
                        } catch {
                            return {
                                id: tweet._id,
                                liked: false,
                                count: 0
                            };
                        }
                    })
                );

                const liked = {};
                const counts = {};

                results.forEach((item) => {
                    liked[item.id] = item.liked;
                    counts[item.id] = item.count;
                });

                setLikedTweets(liked);
                setLikeCounts(counts);
            }
        } catch (error) {
            console.error(error.response?.data || error);
            toast.error("Failed to load tweets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTweets();
    }, [userId]);

    // Create tweet
    const handleCreateTweet = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            toast.error("Please enter tweet content");
            return;
        }

        if (!user) {
            toast.error("Please login to create a tweet");
            return;
        }

        try {
            setPosting(true);

            const response = await api.post("/tweets/create", {
                content: content.trim()
            });

            const newTweet = response.data?.data;

            setTweets((previous) => [
                {
                    ...newTweet,
                    owner: {
                        _id: userId,
                        username: user.username || user.user?.username,
                        fullName: user.fullName || user.user?.fullName,
                        avatar: user.avatar || user.user?.avatar
                    }
                },
                ...previous
            ]);

            setContent("");
            toast.success("Tweet created successfully");
        } catch (error) {
            console.error(error.response?.data || error);
            toast.error(
                error.response?.data?.message || "Failed to create tweet"
            );
        } finally {
            setPosting(false);
        }
    };

    // Edit tweet
    const handleUpdateTweet = async (tweetId) => {
        if (!editingContent.trim()) {
            toast.error("Tweet content cannot be empty");
            return;
        }

        try {
            const response = await api.patch(`/tweets/${tweetId}`, {
                content: editingContent.trim()
            });

            const updatedTweet = response.data?.data;

            setTweets((previous) =>
                previous.map((tweet) =>
                    tweet._id === tweetId
                        ? { ...tweet, ...updatedTweet, owner: tweet.owner }
                        : tweet
                )
            );

            setEditingId(null);
            setEditingContent("");
            toast.success("Tweet updated successfully");
        } catch (error) {
            console.error(error.response?.data || error);
            toast.error(
                error.response?.data?.message || "Failed to update tweet"
            );
        }
    };

    // Delete tweet
    const handleDeleteTweet = async (tweetId) => {
        if (!window.confirm("Delete this tweet?")) return;

        try {
            await api.delete(`/tweets/${tweetId}`);

            setTweets((previous) =>
                previous.filter((tweet) => tweet._id !== tweetId)
            );

            toast.success("Tweet deleted successfully");
        } catch (error) {
            console.error(error.response?.data || error);
            toast.error(
                error.response?.data?.message || "Failed to delete tweet"
            );
        }
    };

    // Like or unlike tweet
    const handleLikeTweet = async (tweetId) => {
        if (!user) {
            toast.error("Please login to like tweets");
            return;
        }

        if (likingId) return;

        try {
            setLikingId(tweetId);

            const response = await api.post(
                `/likes/toggle/t/${tweetId}`
            );

            const liked = response.data?.data?.liked;

            if (typeof liked !== "boolean") {
                throw new Error("Unexpected like response");
            }

            setLikedTweets((previous) => ({
                ...previous,
                [tweetId]: liked
            }));

            setLikeCounts((previous) => ({
                ...previous,
                [tweetId]: Math.max(
                    0,
                    (previous[tweetId] || 0) + (liked ? 1 : -1)
                )
            }));
        } catch (error) {
            console.error(error.response?.data || error);
            toast.error(
                error.response?.data?.message || "Failed to like tweet"
            );
        } finally {
            setLikingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] px-4 py-8 text-white">
            <div className="mx-auto max-w-2xl">
                <h1 className="mb-6 flex items-center gap-3 text-3xl font-bold">
                    <MessageCircle />
                    VidTube Tweets
                </h1>

                {/* Create tweet */}
                {user ? (
                    <form
                        onSubmit={handleCreateTweet}
                        className="mb-8 rounded-2xl bg-[#181818] p-5"
                    >
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's happening?"
                            maxLength={280}
                            rows={3}
                            className="w-full resize-none rounded-xl border border-neutral-700 bg-[#242424] p-3 outline-none focus:border-white"
                        />

                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-sm text-neutral-400">
                                {content.length}/280
                            </span>

                            <button
                                type="submit"
                                disabled={posting || !content.trim()}
                                className="flex items-center gap-2 rounded-full bg-white px-5 py-2 font-semibold text-black disabled:opacity-50"
                            >
                                <Send size={16} />
                                {posting ? "Posting..." : "Tweet"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="mb-6 rounded-xl bg-[#181818] p-4 text-neutral-400">
                        Please log in to create a tweet.
                    </p>
                )}

                {/* Tweet list */}
                {loading ? (
                    <p className="text-neutral-400">Loading tweets...</p>
                ) : tweets.length === 0 ? (
                    <p className="rounded-xl bg-[#181818] p-6 text-center text-neutral-400">
                        No tweets yet. Be the first to tweet!
                    </p>
                ) : (
                    <div className="space-y-4">
                        {tweets.map((tweet) => {
                            const owner =
                                tweet.owner &&
                                typeof tweet.owner === "object"
                                    ? tweet.owner
                                    : {};

                            const ownerId = owner._id || tweet.owner;
                            const isOwner =
                                userId &&
                                ownerId &&
                                String(userId) === String(ownerId);

                            return (
                                <article
                                    key={tweet._id}
                                    className="rounded-2xl border border-neutral-800 bg-[#181818] p-5"
                                >
                                    <div className="flex gap-3">
                                        {owner.avatar ? (
                                            <img
                                                src={owner.avatar}
                                                alt=""
                                                className="h-11 w-11 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-700">
                                                <MessageCircle size={20} />
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <span className="font-semibold">
                                                    {owner.fullName ||
                                                        owner.username ||
                                                        "User"}
                                                </span>

                                                {owner.username && (
                                                    <span className="text-sm text-neutral-400">
                                                        @{owner.username}
                                                    </span>
                                                )}

                                                {tweet.createdAt && (
                                                    <span className="text-xs text-neutral-500">
                                                        {new Date(
                                                            tweet.createdAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>

                                            {editingId === tweet._id ? (
                                                <>
                                                    <textarea
                                                        value={editingContent}
                                                        onChange={(e) =>
                                                            setEditingContent(
                                                                e.target.value
                                                            )
                                                        }
                                                        maxLength={280}
                                                        rows={3}
                                                        className="w-full rounded-lg border border-neutral-700 bg-[#242424] p-3 outline-none"
                                                    />

                                                    <div className="mt-3 flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleUpdateTweet(
                                                                    tweet._id
                                                                )
                                                            }
                                                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
                                                        >
                                                            Save
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingId(null);
                                                                setEditingContent("");
                                                            }}
                                                            className="rounded-full bg-neutral-700 px-4 py-2 text-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="whitespace-pre-wrap break-words leading-6">
                                                    {tweet.content}
                                                </p>
                                            )}

                                            <div className="mt-4 flex items-center gap-5 border-t border-neutral-800 pt-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleLikeTweet(tweet._id)
                                                    }
                                                    disabled={
                                                        likingId === tweet._id
                                                    }
                                                    className={`flex items-center gap-2 text-sm ${
                                                        likedTweets[tweet._id]
                                                            ? "text-blue-400"
                                                            : "text-neutral-400 hover:text-white"
                                                    }`}
                                                >
                                                    <ThumbsUp size={18} />
                                                    {likeCounts[tweet._id] || 0}
                                                    <span>
                                                        {likedTweets[tweet._id]
                                                            ? "Liked"
                                                            : "Like"}
                                                    </span>
                                                </button>

                                                {isOwner &&
                                                    editingId !== tweet._id && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingId(tweet._id);
                                                                    setEditingContent(tweet.content);
                                                                }}
                                                                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
                                                            >
                                                                <Pencil size={16} />
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteTweet(tweet._id)
                                                                }
                                                                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-red-400"
                                                            >
                                                                <Trash2 size={16} />
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Tweets;
