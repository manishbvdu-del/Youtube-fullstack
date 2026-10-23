
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import WatchVideo from "./pages/WatchVideo";
import PlaylistDetails from "./pages/PlaylistDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import LikedVideos from "./pages/LikedVideos";
import LikedComments from "./pages/LikedComments";
import Playlist from "./pages/Playlist";
import Subscription from "./pages/Subscriptions";
import Channel from "./pages/Channel";
import UploadVideo from "./pages/UploadVideo";
import CreatePlaylist from "./pages/CreatePlaylist";
import NotFound from "./pages/NotFound";

function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            <Navbar
                onMenuClick={() => setSidebarOpen((previous) => !previous)}
            />

            <Sidebar open={sidebarOpen} />

            <main
                className={`min-w-0 pt-20 transition-all duration-300 ${
                    sidebarOpen ? "ml-0 md:ml-60" : "ml-0"
                }`}
            >
                <div className="p-4 md:p-6">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/watch/:videoId"
                            element={<WatchVideo />}
                        />

                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/upload" element={<UploadVideo />} />
                        <Route path="/history" element={<History />} />

                        <Route
                            path="/liked-videos"
                            element={<LikedVideos />}
                        />
                        <Route
                            path="/liked-comments"
                            element={<LikedComments />}
                        />

                        <Route path="/playlists" element={<Playlist />} />
                        <Route
                            path="/subscriptions"
                            element={<Subscription />}
                        />
                        <Route
                            path="/channel/:username"
                            element={<Channel />}
                        />
                        <Route path="/create-playlist" element={<CreatePlaylist />} />
                        <Route path="/playlist/:playlistId" element={<PlaylistDetails />} />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: "#272727",
                            color: "#ffffff",
                        },
                    }}
                />

                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/*" element={<Layout />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
