
import api from "../api/axios";

export const updateAccount = async (details) => {
    const response = await api.patch("/users/update-account", details);
    return response.data;
};

export const updateAvatar = async (formData) => {
    const response = await api.patch("/users/avatar", formData);
    return response.data;
};

export const updateCoverImage = async (formData) => {
    const response = await api.patch("/users/cover-image", formData);
    return response.data;
};

export const getChannelProfile = async (username) => {
    const response = await api.get(
        `/users/c/${encodeURIComponent(username)}`
    );
    return response.data;
};

export const getWatchHistory = async () => {
    const response = await api.get("/users/history");
    return response.data;
};
