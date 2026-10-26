
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ListVideo } from "lucide-react";
import api from "../api/axios";

const CreatePlaylist = () => {
    const navigate = useNavigate();

    // Store the input values
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    // Store loading and error states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Handle form submission
   
const handleCreatePlaylist = async (e) => {
    e.preventDefault();

    console.log("1. Form submitted");
    console.log("2. Name:", name);
    console.log("3. Description:", description);

    if (!name.trim() || !description.trim()) {
        setError("Please enter both playlist name and description.");
        console.log("Validation failed");
        return;
    }

    try {
        setLoading(true);
        setError("");

        console.log("4. Sending POST /playlists");

        const response = await api.post("/playlists", {
            name: name.trim(),
            description: description.trim(),
        });

        console.log("5. API SUCCESS:", response.status);
        console.log("6. Response data:", response.data);

        alert("Playlist created successfully!");

        navigate("/playlists", { replace: true });
    } catch (err) {
        console.error("PLAYLIST ERROR:", err);
        console.error("Error status:", err.response?.status);
        console.error("Error response:", err.response?.data);
        console.error("Request URL:", err.config?.url);

        const message =
            err.response?.data?.message ||
            err.message ||
            "Unable to create playlist.";

        setError(message);
    } finally {
        setLoading(false);
    }
};


    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white px-4 py-6 sm:px-8">

            {/* Back navigation */}
            <Link
                to="/playlists"
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white"
            >
                <ArrowLeft size={20} />
                Back to playlists
            </Link>

            {/* Form container */}
            <div className="mx-auto mt-10 max-w-xl rounded-xl bg-[#181818] p-6 sm:p-8">

                <div className="mb-6 flex items-center gap-3">
                    <ListVideo size={30} />

                    <h1 className="text-2xl font-bold">
                        Create Playlist
                    </h1>
                </div>

                <form onSubmit={handleCreatePlaylist}>

                    {/* Playlist name */}
                    <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium"
                    >
                        Playlist name
                    </label>

                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter playlist name"
                        maxLength={100}
                        required
                        className="mb-5 w-full rounded-lg border border-gray-700 bg-[#0f0f0f] p-3 outline-none focus:border-white"
                    />

                    {/* Playlist description */}
                    <label
                        htmlFor="description"
                        className="mb-2 block text-sm font-medium"
                    >
                        Description
                    </label>

                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your playlist"
                        rows={4}
                        maxLength={500}
                        required
                        className="mb-5 w-full resize-y rounded-lg border border-gray-700 bg-[#0f0f0f] p-3 outline-none focus:border-white"
                    />

                    {/* Display errors from validation or backend */}
                    {error && (
                        <p className="mb-4 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-white px-5 py-3 font-semibold text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Playlist"}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default CreatePlaylist;
