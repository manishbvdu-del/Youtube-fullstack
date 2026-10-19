
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
        const response = await api.get(`/likes/video/${videoId}`);
        return response.data;
    },

    // Get comment like count and current user's like status
    getCommentLikeCount: async (commentId) => {
        const response = await api.get(`/likes/comment/${commentId}`);
        return response.data;
    },

    // Get tweet like count and current user's like status
    getTweetLikeCount: async (tweetId) => {
        const response = await api.get(`/likes/tweet/${tweetId}`);
        return response.data;
    },

};

export default LikeService;
