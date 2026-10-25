
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

 // This function runs when the user selects a video file
const handleVideoChange = (e) => {

    // Get the first file selected by the user
    // e.target represents the file input
    // files contains the selected files
    // ?. prevents an error if files is null or undefined
    const file = e.target.files?.[0];

    // If no file is selected, stop the function
    if (!file) return;

    // Check whether the selected file is a video
    // startsWith("video/") checks the file's MIME type
    if (!file.type.startsWith("video/")) {

      // Display an error message if the file is not a video
      setError("Please select a valid video file.");

      // Stop processing the invalid file
      return;
    }

    // Clear any previous error message
    setError("");

    // Reset the previous video's duration to zero
    setDuration(0);

    // Store the selected File object in React state
    // This file will be used when uploading to the backend
    setVideoFile(file);

    // Check whether a previous video preview URL exists
    if (videoPreview) {

      // Release the previous preview URL because it is no longer needed
      // This helps avoid keeping unnecessary object URLs around
      URL.revokeObjectURL(videoPreview);
    }

    // Create a temporary URL for previewing the selected video
    // This does not upload the video to the server
    const previewUrl = URL.createObjectURL(file);

    // Store the preview URL in React state
    // The UI can use it as the source of a <video> element
    setVideoPreview(previewUrl);

    // Create a temporary HTML video element using JavaScript
    // It is used to read the video's metadata
    const video = document.createElement("video");

    // Ask the browser to preload video metadata
    // Metadata includes information such as duration and dimensions
    video.preload = "metadata";

    // This function runs when the video's metadata has loaded
    video.onloadedmetadata = () => {

      // Read the video's duration in seconds
      const videoDuration = video.duration;

      // Release the temporary URL used for reading metadata
      // This is separate from the previewUrl
      URL.revokeObjectURL(video.src);

      // Check whether the duration is invalid
      // Number.isFinite() rejects NaN and Infinity
      // Duration must also be greater than zero
      if (!Number.isFinite(videoDuration) || videoDuration <= 0) {

        // Reset the duration because it is invalid
        setDuration(0);

        // Display an error message to the user
        setError("Unable to read video duration. Please select another video.");

        // Stop this metadata handler
        return;
      }

      // Store the valid duration in React state
      // Example: 625 seconds means 10 minutes and 25 seconds
      setDuration(videoDuration);
    };

    // This function runs if the browser encounters a media error
    video.onerror = () => {

      // Release the temporary metadata URL
      URL.revokeObjectURL(video.src);

      // Reset the duration because metadata could not be read
      setDuration(0);

      // Tell the user that the video's metadata could not be read
      setError("Unable to read video metadata. Please select another video.");
    };

    // Create another temporary URL and assign it to the video element
    // This starts loading the video metadata
    // The event handlers above are registered before loading begins
    video.src = URL.createObjectURL(file);
};
const handleThumbnailChange = (e) => {
    // Get the first selected file from the input element.
    const file = e.target.files?.[0];

    // If no file is selected, stop the function.
    if (!file) return;

    // Check whether the selected file is an image.
    // Examples: image/png, image/jpeg, image/webp.
    if (!file.type.startsWith("image/")) {
      // Display an error if the selected file is not an image.
      setError("Please select a valid thumbnail image.");

      // Stop the function so the invalid file is not saved.
      return;
    }

    // Clear any previous error message.
    setError("");

    // Store the selected image file in React state.
    // This file can later be sent to the backend for uploading.
    setThumbnail(file);

    // Check whether an old thumbnail preview URL exists.
    if (thumbnailPreview) {
      // Release the old preview URL from memory
      // because it is no longer needed.
      URL.revokeObjectURL(thumbnailPreview);
    }

    // Create a temporary URL for the selected image
    // and store it in state to display the preview.
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
