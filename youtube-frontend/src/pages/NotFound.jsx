
import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center px-4 text-center">
            <div className="text-8xl font-bold text-gray-700 mb-4">
                404
            </div>

            <div className="text-6xl mb-6">
                📺
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-3">
                Page Not Found
            </h1>

            <p className="text-gray-400 max-w-md mb-8">
                Sorry, the page you are looking for doesn't exist or may have
                been removed.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
                <button
                    onClick={() => navigate("/")}
                    className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
                >
                    Go to Home
                </button>

                <button
                    onClick={() => navigate(-1)}
                    className="bg-[#272727] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#3f3f3f] transition"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default NotFound;
