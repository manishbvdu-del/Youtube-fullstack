
import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const UploadVideo = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid thumbnail image.");
      return;
    }

    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please enter a video title.");
      return;
    }

    if (!videoFile) {
      setError("Please select a video file.");
      return;
    }

    if (!thumbnail) {
      setError("Please select a thumbnail image.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("videoFile", videoFile);
      formData.append("thumbnail", thumbnail);

      const response = await api.post(
        "/videos/upload",
        formData
      );

      setSuccess(
        response.data.message || "Video uploaded successfully!"
      );

      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnail(null);
      setVideoPreview("");
      setThumbnailPreview("");

      e.target.reset();

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Video upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Upload Video
        </h1>

        <p className="text-gray-400 mb-8">
          Share your video with the world.
        </p>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 p-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/40 border border-green-700 text-green-300 p-3 rounded-lg mb-5">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-8 space-y-6"
        >
          {/* Video File */}
          <div>
            <label className="block font-semibold mb-2">
              Video File *
            </label>

            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-black file:font-semibold hover:file:bg-gray-200"
            />

            {videoFile && (
              <p className="text-sm text-gray-400 mt-2">
                Selected: {videoFile.name}
              </p>
            )}

            {videoPreview && (
              <video
                src={videoPreview}
                controls
                className="w-full max-h-72 mt-4 rounded-xl bg-black"
              />
            )}
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block font-semibold mb-2">
              Thumbnail *
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-black file:font-semibold hover:file:bg-gray-200"
            />

            {thumbnail && (
              <p className="text-sm text-gray-400 mt-2">
                Selected: {thumbnail.name}
              </p>
            )}

            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full max-h-64 object-contain mt-4 rounded-xl bg-black"
              />
            )}
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block font-semibold mb-2"
            >
              Video Title *
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your video title"
              maxLength={150}
              required
              className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-white"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block font-semibold mb-2"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video..."
              rows={5}
              className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-white resize-y"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading..." : "Upload Video"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadVideo;
