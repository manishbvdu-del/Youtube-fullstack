
import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

   
const fetchCurrentUser = useCallback(async () => {
    setLoading(true);

    try {
        const response = await api.get("/users/current-user");

        console.log("Current user API response:", response.data);

        const userData = response.data?.data;

        if (userData && typeof userData === "object") {
            setUser(userData);
        } else {
            setUser(null);
        }
    } catch (error) {
        setUser(null);
        console.error(
            "Failed to fetch current user:",
            error.response?.data || error.message
        );
    } finally {
        setLoading(false);
    }
}, []);


    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await api.post("/users/logout");
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            setUser(null);
        }
    };

    const value = {
        user,
        setUser,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        refreshUser: fetchCurrentUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
