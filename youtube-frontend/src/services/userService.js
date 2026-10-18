
import api from "../api/axios";

export const registerUser = async (formData) => {
    const response = await api.post("/users/register", formData);
    return response.data;
};

export const loginUser = async (credentials) => {
    console.log("LOGIN CREDENTIALS:", credentials);
    console.log("IS FORMDATA:", credentials instanceof FormData);

    const response = await api.post("/users/login", credentials);

    return response.data;
};


export const logoutUser = async () => {
    const response = await api.post("/users/logout");
};

export const getCurrentUser = async () => {
    const response = await api.get("/users/current-user");
    return response.data;
};

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

export const changePassword = async (passwords) => {
    const response = await api.post("/users/change-password", passwords);
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