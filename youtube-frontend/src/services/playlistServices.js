
import api from "../api/axios";

const PlaylistService = {
    // Create a new playlist
    createPlaylist: async (data) => {
        const response = await api.post("/playlists", data);
        return response.data;
    },

    // Get playlists of a user
    getUserPlaylists: async (userId) => {
        const response = await api.get(`/playlists/user/${userId}`);
        return response.data;
    },

    // Get playlist by ID
    getPlaylistById: async (playlistId) => {
        const response = await api.get(`/playlists/${playlistId}`);
        return response.data;
    },

    // Update playlist details
    updatePlaylist: async (playlistId, data) => {
        const response = await api.patch(`/playlists/${playlistId}`, data);
        return response.data;
    },

    // Delete a playlist
    deletePlaylist: async (playlistId) => {
        const response = await api.delete(`/playlists/${playlistId}`);
        return response.data;
    },

    // Add video to playlist
    addVideoToPlaylist: async (playlistId, videoId) => {
        const response = await api.post(
            `/playlists/${playlistId}/videos/${videoId}`
        );
        return response.data;
    },

    // Remove video from playlist
    removeVideoFromPlaylist: async (playlistId, videoId) => {
        const response = await api.delete(
            `/playlists/${playlistId}/videos/${videoId}`
        );
        return response.data;
    }
};

export default PlaylistService;
