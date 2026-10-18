
import api from "../api/axios";

const VideoService = {
    // Get all videos
    getAllVideos: async (params = {}) => {
        const response = await api.get("/videos", { params });
        return response.data;
    },

    // Get video by ID
    getVideoById: async (videoId) => {
        const response = await api.get(`/videos/${videoId}`);
        return response.data;
    },

    // Increment video views
    incrementViews: async (videoId) => {
        const response = await api.patch(`/videos/${videoId}/views`);
        return response.data;
    },

    // Upload video and thumbnail
    uploadVideo: async (formData) => {
        const response = await api.post("/videos/upload", formData);
        return response.data;
    },

    // Update video details
    updateVideo: async (videoId, data) => {
        const response = await api.patch(`/videos/${videoId}`, data);
        return response.data;
    },

    // Delete video
    deleteVideo: async (videoId) => {
        const response = await api.delete(`/videos/${videoId}`);
        return response.data;
    },

    // Toggle publish status
    togglePublishStatus: async (videoId) => {
        const response = await api.patch(
            `/videos/${videoId}/toggle-publish`
        );
        return response.data;
    }
};

export default VideoService;
