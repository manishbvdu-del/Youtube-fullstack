
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import WatchVideo from "./pages/WatchVideo";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import LikedVideos from "./pages/LikedVideos";
import LikedComments from "./pages/LikedComments";
import Playlist from "./pages/Playlist";
import Subscription from "./pages/Subscriptions";
import Channel from "./pages/Channel";
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
                        {/* Home and video */}
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/watch/:videoId"
                            element={<WatchVideo />}
                        />

                        {/* User dashboard */}
                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        {/* Watch history */}
                        <Route
                            path="/history"
                            element={<History />}
                        />

                        {/* Liked content */}
                        <Route
                            path="/liked-videos"
                            element={<LikedVideos />}
                        />
                        <Route
                            path="/liked-comments"
                            element={<LikedComments />}
                        />

                        {/* Playlists */}
                        <Route
                            path="/playlists"
                            element={<Playlist />}
                        />

                        {/* Subscriptions */}
                        <Route
                            path="/subscriptions"
                            element={<Subscription />}
                        />
                        <Route
                        path="/channel"
                        element={<Channel/>}
                        />

                        {/* 404 */}
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
                {/* Authentication pages without sidebar */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Main application layout */}
                <Route path="/*" element={<Layout />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
