
import { useCallback, useEffect, useState } from "react";
import {
    MessageCircle, Pencil, Trash2,X,Send,ThumbsUp} from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

function Comments({ videoId, user, currentUserId }) {
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [commentLikes, setCommentLikes] = useState({});
    const [commentLikingId, setCommentLikingId] = useState(null);

    // Fetch comments for the current video
    const fetchComments = useCallback(async () => {
        if (!videoId) {
            setComments([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const response = await api.get(`/comments/${videoId}`);
            const data = response.data?.data;

            const list = Array.isArray(data)
                ? data
                : data?.comments || data?.docs || [];

            setComments(list);
        } catch (err) {
            console.error(
                "Failed to fetch comments:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                    "Unable to load comments."
            );
        } finally {
            setLoading(false);
        }
    }, [videoId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Fetch likes for comments
    useEffect(() => {
        let cancelled = false;

        const fetchCommentLikes = async () => {
            if (!user || comments.length === 0) {
                setCommentLikes({});
                return;
            }

            const entries = await Promise.all(
                comments.map(async (item) => {
                    const comment = item.comment || item;

                    if (!comment?._id) {
                        return null;
                    }

                    try {
                        const response = await api.get(
                            `/likes/comment/${comment._id}`
                        );

                        const data = response.data?.data || {};

                        return [
                            comment._id,
                            {
                                count: Number(
                                    data.likeCount ??
                                    data.likesCount ??
                                    data.totalLikes ??
                                    0
                                ),
                                liked: Boolean(
                                    data.isLiked ?? data.liked
                                )
                            }
                        ];
                    } catch (err) {
                        console.error(
                            "Failed to fetch comment likes:",
                            err.response?.data || err.message
                        );

                        return [
                            comment._id,
                            {
                                count: 0,
                                liked: false
                            }
                        ];
                    }
                })
            );

            if (!cancelled) {
                setCommentLikes(
                    Object.fromEntries(entries.filter(Boolean))
                );
            }
        };

        fetchCommentLikes();

        return () => {
            cancelled = true;
        };
    }, [comments, user]);

    // Add a comment
   // Function to handle adding a new comment
const handleAddComment = async (event) => {

    // Prevent the default form submission behavior.
    // Normally, submitting a form reloads the browser page.
    // We don't want the page to reload.
    event.preventDefault();


    // Remove unnecessary spaces from the beginning and end
    // of the comment entered by the user.
    //
    // Example:
    // commentText = "   Nice video!   "
    // content = "Nice video!"
    const content = commentText.trim();


    // Check whether the user entered an empty comment.
    // If content is empty, show an error message and stop execution.
    if (!content) {
        toast.error("Please enter a comment.");
        return;
    }


    // Check whether the user is logged in.
    // If user is null or undefined, the user is not logged in.
    // Only logged-in users can add comments.
    if (!user) {
        toast.error("Please log in to comment.");
        return;
    }


    // Start the try block.
    // We use try-catch because the API request can fail.
    try {

        // Set submitting to true.
        // This tells React that the comment submission is in progress.
        // We can use this state to disable the submit button.
        setSubmitting(true);


        // Send a POST request to the backend.
        //
        // URL: /comments/${videoId}
        // Body: { content: "Nice video!" }
        //
        // The backend receives the comment content
        // and the video ID to which the comment belongs.
        await api.post(`/comments/${videoId}`, {
            content
        });


        // After the backend successfully creates the comment,
        // clear the input field.
        //
        // React updates commentText to an empty string.
        // If textarea value is connected to commentText,
        // the textarea becomes empty automatically.
        setCommentText("");


        // Fetch comments again from the backend.
        //
        // Why?
        // The newly created comment may need populated owner details,
        // such as username, avatar and other user information.
        //
        // fetchComments() gets the latest comments from the database
        // and updates the comments state.
        await fetchComments();


        // Show a success message after the comment is added
        // and comments are fetched successfully.
        toast.success("Comment added.");


    } catch (err) {

        // If the API request or fetchComments() fails,
        // execution comes here.
        //
        // Print the actual error in the browser console.
        console.error(
            "Failed to add comment:",
            err.response?.data || err.message
        );


        // Show the backend error message if available.
        // Otherwise, show the default error message.
        toast.error(
            err.response?.data?.message ||
                "Unable to add comment."
        );


    } finally {

        // This block always executes whether the try succeeds or fails.
        //
        // Set submitting back to false.
        // This allows the user to submit another comment.
        setSubmitting(false);
    }
};
    // Save edited comment
    const handleSaveEdit = async (commentId) => {
        const content = editText.trim();

        if (!content) {
            toast.error("Comment cannot be empty.");
            return;
        }

        if (!user) {
            toast.error("Please log in first.");
            return;
        }

        try {
            setSavingEdit(true);

            await api.patch(`/comments/c/${commentId}`, {
                content
            });

            setEditingId(null);
            setEditText("");

            await fetchComments();

            toast.success("Comment updated.");
        } catch (err) {
            console.error(
                "Failed to update comment:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                    "Unable to update comment."
            );
        } finally {
            setSavingEdit(false);
        }
    };

    // Delete comment
    const handleDeleteComment = async (commentId) => {
        if (!user) {
            toast.error("Please log in first.");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this comment?"
        );

        if (!confirmed) return;

        try {
            setDeletingId(commentId);

            await api.delete(`/comments/c/${commentId}`);

            setComments((prev) =>
                prev.filter((item) => {
                    const comment = item.comment || item;
                    return comment._id !== commentId;
                })
            );

            setCommentLikes((prev) => {
                const next = { ...prev };
                delete next[commentId];
                return next;
            });

            if (editingId === commentId) {
                setEditingId(null);
                setEditText("");
            }

            toast.success("Comment deleted.");
        } catch (err) {
            console.error(
                "Failed to delete comment:",
                err.response?.data || err.message
            );

            toast.error(
                err.response?.data?.message ||
                    "Unable to delete comment."
            );
        } finally {
            setDeletingId(null);
        }
    };

 // Like or unlike a comment
 const handleToggleCommentLike = async (commentId) => {

     // STEP 1: Check whether the user is logged in
     // If user is not logged in, do not allow liking
     if (!user) {
         toast.error("Please log in to like comments.");
         return;
     }

     // STEP 2: Prevent multiple like requests at the same time
     // If one comment like request is already running, stop this request
     if (commentLikingId) return;

     // STEP 3: Store the previous like state of this comment
     // If no state exists yet, use count = 0 and liked = false
     const previousLike = commentLikes[commentId] || {
         count: 0,
         liked: false
     };

     try {
         // STEP 4: Remember which comment is currently being liked
         // Useful for disabling its button while the API request runs
         setCommentLikingId(commentId);

         // STEP 5: Send a request to the backend
         // Backend decides whether to add or remove the like
         const response = await api.post(
             `/likes/toggle/c/${commentId}`
         );

         // STEP 6: Read the response data safely
         // Expected response may contain liked status and like count
         const data = response.data?.data || {};

         // STEP 7: Determine the new like status
         // Prefer the server's liked value, then isLiked
         // If neither exists, assume the status has toggled
         const liked =
             typeof data.liked === "boolean"
                 ? data.liked
                 : typeof data.isLiked === "boolean"
                     ? data.isLiked
                     : !previousLike.liked;

         // STEP 8: Get the updated like count from the server
         // Different backends may use different property names
         const serverCount =
             data.likeCount ??
             data.likesCount ??
             data.totalLikes;

         // STEP 9: Update the React state for this comment
         // Keep the like states of all other comments unchanged
         setCommentLikes((prev) => ({
             ...prev,
             [commentId]: {
                 liked,

                 // Use the server count when available
                 // Otherwise calculate the new count locally
                 count:
                     serverCount !== undefined
                         ? Number(serverCount)
                         : Math.max(
                             0,
                             previousLike.count +
                                 (liked === previousLike.liked
                                     ? 0
                                     : liked
                                         ? 1
                                         : -1)
                         )
             }
         }));

     } catch (err) {
         // STEP 10: Log the error for debugging
         console.error(
             "Failed to toggle comment like:",
             err.response?.data || err.message
         );

         // Show an understandable error message to the user
         toast.error(
             err.response?.data?.message ||
                 "Unable to like this comment."
         );

     } finally {
         // STEP 11: Clear the loading state whether request succeeds or fails
         setCommentLikingId(null);
     }
 };

    return (
        <section className="mt-6 rounded-xl bg-[#181818] p-4 text-white">
            {/* Heading */}
            <div className="mb-4 flex items-center gap-2">
                <MessageCircle size={20} />

                <h2 className="text-lg font-bold">
                    Comments ({comments.length})
                </h2>
            </div>

            {/* Add comment form */}
            <form
                onSubmit={handleAddComment}
                className="mb-6 flex gap-2"
            >
                <input
                    type="text"
                    value={commentText}
                    onChange={(event) =>
                        setCommentText(event.target.value)
                    }
                    placeholder={
                        user
                            ? "Add a comment..."
                            : "Log in to add a comment"
                    }
                    disabled={!user || submitting}
                    maxLength={1000}
                    className="min-w-0 flex-1 rounded-full border border-neutral-700 bg-[#272727] px-4 py-3 text-sm outline-none focus:border-neutral-400 disabled:opacity-60"
                />

                <button
                    type="submit"
                    disabled={
                        !user ||
                        submitting ||
                        !commentText.trim()
                    }
                    aria-label="Post comment"
                    className="rounded-full bg-white px-4 text-black disabled:opacity-50"
                >
                    <Send size={18} />
                </button>
            </form>

            {/* Loading state */}
            {loading ? (
                <p className="py-4 text-sm text-neutral-400">
                    Loading comments...
                </p>
            ) : comments.length === 0 ? (
                <p className="py-4 text-sm text-neutral-400">
                    No comments yet. Be the first to comment.
                </p>
            ) : (
                <div className="space-y-5">
                    {comments.map((item) => {
                        const comment = item.comment || item;

                        if (!comment?._id) return null;

                        const owner = comment.owner || {};

                        // Support populated owner objects
                        const ownerId =
                            typeof owner === "object"
                                ? owner._id || owner.id
                                : owner;

                        const loggedInUserId =
                            currentUserId ||
                            user?._id ||
                            user?.id;

                        const isOwner =
                            loggedInUserId &&
                            ownerId &&
                            String(loggedInUserId) === String(ownerId);
                        const likes =
                            commentLikes[comment._id] || {
                                count: 0,
                                liked: false
                            };

                        const avatar =
                            typeof owner.avatar === "string"
                                ? owner.avatar
                                : owner.avatar?.url;

                        const displayName =
                            owner.fullName ||
                            owner.fullname ||
                            owner.username ||
                            "Unknown User";

                        return (
                            <article
                                key={comment._id}
                                className="flex gap-3"
                            >
                                {/* User avatar */}
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt={displayName}
                                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-700 font-semibold">
                                        {displayName
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    {/* Commenter's name */}
                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold">
                                            {displayName}
                                        </span>

                                        {owner.username && (
                                            <span className="text-xs text-neutral-500">
                                                @{owner.username}
                                            </span>
                                        )}
                                    </div>

                                    {/* Edit comment form */}
                                    {editingId === comment._id ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={editText}
                                                onChange={(event) =>
                                                    setEditText(
                                                        event.target.value
                                                    )
                                                }
                                                rows={3}
                                                maxLength={1000}
                                                className="w-full rounded-lg border border-neutral-700 bg-[#272727] p-3 text-sm outline-none focus:border-neutral-400"
                                            />

                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSaveEdit(
                                                            comment._id
                                                        )
                                                    }
                                                    disabled={savingEdit}
                                                    className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-black disabled:opacity-50"
                                                >
                                                    {savingEdit
                                                        ? "Saving..."
                                                        : "Save"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setEditText("");
                                                    }}
                                                    disabled={savingEdit}
                                                    className="rounded-full bg-neutral-700 px-3 py-1.5 text-sm disabled:opacity-50"
                                                >
                                                    <X
                                                        size={14}
                                                        className="mr-1 inline"
                                                    />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-neutral-200">
                                            {comment.content}
                                        </p>
                                    )}

                                    {/* Comment actions */}
                                    <div className="mt-2 flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleToggleCommentLike(
                                                    comment._id
                                                )
                                            }
                                            disabled={
                                                !user ||
                                                commentLikingId ===
                                                    comment._id
                                            }
                                            className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-xs transition disabled:opacity-50 ${
                                                likes.liked
                                                    ? "bg-blue-600/20 text-blue-400"
                                                    : "text-neutral-400 hover:bg-neutral-700 hover:text-white"
                                            }`}
                                        >
                                            <ThumbsUp size={14} />

                                            {likes.count}{" "}
                                            {likes.liked
                                                ? "Liked"
                                                : "Like"}
                                        </button>

                                        {/* Only comment owner can edit/delete */}
                                        {isOwner &&
                                            editingId !== comment._id && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingId(
                                                                comment._id
                                                            );

                                                            setEditText(
                                                                comment.content ||
                                                                    ""
                                                            );
                                                        }}
                                                        className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white"
                                                    >
                                                        <Pencil size={13} />
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteComment(
                                                                comment._id
                                                            )
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            comment._id
                                                        }
                                                        className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-400 disabled:opacity-50"
                                                    >
                                                        <Trash2 size={13} />

                                                        {deletingId ===
                                                        comment._id
                                                            ? "Deleting..."
                                                            : "Delete"}
                                                    </button>
                                                </>
                                            )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default Comments;
