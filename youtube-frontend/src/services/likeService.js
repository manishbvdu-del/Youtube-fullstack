
import api from "../api/axios";

const LikeService = {
    // Like or unlike a video
    toggleVideoLike: async (videoId) => {
        const response = await api.post(`/likes/toggle/v/${videoId}`);
        return response.data;
    },

    // Like or unlike a comment
    toggleCommentLike: async (commentId) => {
        const response = await api.post(`/likes/toggle/c/${commentId}`);
        return response.data;
    },

    // Like or unlike a tweet
    toggleTweetLike: async (tweetId) => {
        const response = await api.post(`/likes/toggle/t/${tweetId}`);
        return response.data;
    },

    // Get video like count and current user's like status
    getVideoLikeCount: async (videoId) => {
        const response = await api.get(`/likes/v/${videoId}`);
        return response.data;
    },

    // Get comment like count and current user's like status
    getCommentLikeCount: async (commentId) => {
        const response = await api.get(`/likes/c/${commentId}`);
        return response.data;
    },

    // Get tweet like count and current user's like status
    getTweetLikeCount: async (tweetId) => {
        const response = await api.get(`/likes/t/${tweetId}`);
        return response.data;
    },

    // Get videos liked by the current user
    getLikedVideos: async () => {
        const response = await api.get("/likes/videos");
        return response.data;
    },

    // Get comments liked by the current user
    getLikedComments: async () => {
        const response = await api.get("/likes/comments");
        return response.data;
    }
};

export default LikeService;
