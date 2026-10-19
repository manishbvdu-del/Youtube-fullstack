
import api from "../api/axios";

const AuthService = {
    // Register a new user
    register: async (formData) => {
        const response = await api.post("/users/register", formData);
        return response.data;
    },

    // Login user
    login: async (credentials) => {
        const response = await api.post("/users/login", credentials);
        return response.data;
    },

    // Logout user
    logout: async () => {
        const response = await api.post("/users/logout");
        return response.data;
    },

    // Get currently logged-in user
    getCurrentUser: async () => {
        const response = await api.get("/users/current-user");
        return response.data;
    },

    // Refresh access token
    refreshToken: async () => {
        const response = await api.post("/users/refresh-token");
        return response.data;
    },

    // Change password
    changePassword: async (data) => {
        const response = await api.post("/users/change-password", data);
        return response.data;
    },

    // Update account details
    updateAccount: async (data) => {
        const response = await api.patch("/users/update-account", data);
        return response.data;
    },

    // Update avatar
    updateAvatar: async (formData) => {
        const response = await api.patch("/users/avatar", formData);
        return response.data;
    },

    // Update cover image
    updateCoverImage: async (formData) => {
        const response = await api.patch("/users/cover-image", formData);
        return response.data;
    },

    // Get user channel profile
    getUserChannelProfile: async (username) => {
        const response = await api.get(`/users/c/${encodeURIComponent(username)}`);
        return response.data;
    },

    // Get watch history
    getWatchHistory: async () => {
        const response = await api.get("/users/history");
        return response.data;
    }
};

export default AuthService;
