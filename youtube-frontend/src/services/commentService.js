
import api from "../api/axios";

const CommentService = {
    // Add a comment to a video
    addComment: async (videoId, content) => {
        const response = await api.post(`/comments/${videoId}`, {
            content
        });
        return response.data;
    },

    // Get comments for a video
    getVideoComments: async (videoId) => {
        const response = await api.get(`/comments/${videoId}`);
        return response.data;
    },

    // Update a comment
    updateComment: async (commentId, content) => {
        const response = await api.patch(`/comments/c/${commentId}`, {
            content
        });
        return response.data;
    },

    // Delete a comment
    deleteComment: async (commentId) => {
        const response = await api.delete(`/comments/c/${commentId}`);
        return response.data;
    }
};

export default CommentService;
