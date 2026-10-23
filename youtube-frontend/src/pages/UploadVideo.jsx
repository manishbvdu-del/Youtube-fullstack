
import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const UploadVideo = () => {
  const navigate = useNavigate();

  const [duration, setDuration] = useState(0);
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

    setError("");
    setDuration(0);
    setVideoFile(file);

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);

    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const videoDuration = video.duration;

      URL.revokeObjectURL(video.src);

      if (!Number.isFinite(videoDuration) || videoDuration <= 0) {
        setDuration(0);
        setError("Unable to read video duration. Please select another video.");
        return;
      }

      setDuration(videoDuration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      setDuration(0);
      setError("Unable to read video metadata. Please select another video.");
    };

    video.src = URL.createObjectURL(file);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid thumbnail image.");
      return;
    }

    setError("");
    setThumbnail(file);

    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please enter a video title.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a video description.");
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

    if (!duration || duration <= 0) {
      setError("Please wait for the video duration to load.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("duration", String(duration));
      formData.append("videoFile", videoFile);
      formData.append("thumbnail", thumbnail);

      const response = await api.post("/videos/upload", formData);

      setSuccess(
        response.data.message || "Video uploaded successfully!"
      );

      setTitle("");
      setDescription("");
      setDuration(0);
      setVideoFile(null);
      setThumbnail(null);

      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }

      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }

      setVideoPreview("");
      setThumbnailPreview("");

      e.target.reset();

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error("Video upload failed:", err.response?.data || err);
      console.error("Status:", err.response?.status);

      const responseData = err.response?.data;

      setError(
        typeof responseData === "string"
          ? responseData.replace(/<[^>]*>/g, " ").trim()
          : responseData?.message ||
            responseData?.error ||
            "Video upload failed. Check the backend terminal."
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
              required
              disabled={loading}
              className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-black file:font-semibold hover:file:bg-gray-200"
            />

            {videoFile && (
              <p className="text-sm text-gray-400 mt-2">
                Selected: {videoFile.name}
              </p>
            )}

            {duration > 0 && (
              <p className="text-sm text-green-400 mt-2">
                Duration: {Math.floor(duration / 60)}:
                {String(Math.floor(duration % 60)).padStart(2, "0")}
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
              required
              disabled={loading}
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
              disabled={loading}
              className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 outline-none focus:border-white"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block font-semibold mb-2"
            >
              Description *
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video..."
              rows={5}
              required
              disabled={loading}
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
