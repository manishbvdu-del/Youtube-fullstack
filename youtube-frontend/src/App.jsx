import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AppRoutes from "./routes/AppRoutes";

function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            <Navbar
                onMenuClick={() =>
                    setSidebarOpen((previous) => !previous)
                }
            />

            <Sidebar open={sidebarOpen} />

            <main
                className={`min-w-0 pt-20 transition-all duration-300 ${
                    sidebarOpen ? "ml-0 md:ml-60" : "ml-0"
                }`}
            >
                <div className="p-4 md:p-6">
                    <AppRoutes />
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
                    {/* Authentication Pages */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Main Application */}
                    <Route path="/*" element={<Layout />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;


// What is BrowserRouter?
// BrowserRouter is a component provided by react-router-dom.
// It allows React Router to track the browser's URL and render the appropriate component for that URL.