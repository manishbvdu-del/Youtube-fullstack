
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import Tweets from "../pages/Tweets";
import WatchVideo from "../pages/WatchVideo";
import PlaylistDetails from "../pages/PlaylistDetails";
import Dashboard from "../pages/Dashboard";
import History from "../pages/History";
import LikedVideos from "../pages/LikedVideos";
import LikedComments from "../pages/LikedComments";
import Playlist from "../pages/Playlist";
import Subscription from "../pages/Subscriptions";
import Channel from "../pages/Channel";
import UploadVideo from "../pages/UploadVideo";
import CreatePlaylist from "../pages/CreatePlaylist";
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route
                path="/watch/:videoId"
                element={<WatchVideo />}
            />
            <Route
                path="/channel/:username"
                element={<Channel />}
            />

            {/* Protected Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/upload"
                element={
                    <ProtectedRoute>
                        <UploadVideo />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/history"
                element={
                    <ProtectedRoute>
                        <History />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/liked-videos"
                element={
                    <ProtectedRoute>
                        <LikedVideos />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/liked-comments"
                element={
                    <ProtectedRoute>
                        <LikedComments />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/playlists"
                element={
                    <ProtectedRoute>
                        <Playlist />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/create-playlist"
                element={
                    <ProtectedRoute>
                        <CreatePlaylist />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/playlist/:playlistId"
                element={
                    <ProtectedRoute>
                        <PlaylistDetails />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/subscriptions"
                element={
                    <ProtectedRoute>
                        <Subscription />
                    </ProtectedRoute>
                }
            />
            <Route 
            path="/tweets"
             element={
                <ProtectedRoute>
                <Tweets />
                </ProtectedRoute>
            }
            />

            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
