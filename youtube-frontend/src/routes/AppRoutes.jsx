import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Search from "./pages/Search";

// Other existing imports: Home, Login, Register, etc.

<Routes>
  {/* Public routes */}
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/watch/:videoId" element={<WatchVideo />} />

  {/* Protected routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/upload" element={<UploadVideo />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/history" element={<History />} />
    <Route path="/liked-videos" element={<LikedVideos />} />
    <Route path="/playlists" element={<Playlist />} />
    <Route path="/subscriptions" element={<Subscriptions />} />
    <Route path="/search" element={<Search />} />
  </Route>

  <Route path="*" element={<NotFound />} />
</Routes>