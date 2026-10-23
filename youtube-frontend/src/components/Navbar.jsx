
import { Menu, Search, Video, Bell, UserRound, LogOut } from "lucide-react";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

function Navbar({ onMenuClick }) {
    const [search, setSearch] = useState("");
    const [loggingOut, setLoggingOut] = useState(false);

    const { user, loading, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const username = user?.username || user?.user?.username;
    const avatar = user?.avatar || user?.user?.avatar;

    const handleSearch = (e) => {
        e.preventDefault();

        if (search.trim()) {
            navigate(`/?search=${encodeURIComponent(search.trim())}`);
        }
    };

    const handleLogout = async () => {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            await logout();
            toast.success("Logged out successfully");
            navigate("/login", { replace: true });
        } catch (error) {
            toast.error("Unable to log out");
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-neutral-800 bg-[#0f0f0f] px-4 md:px-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="rounded-full p-2 hover:bg-neutral-800"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={24} />
                </button>

                <Link to="/" className="flex items-center gap-2">
                    <span className="text-2xl text-red-600">▶</span>
                    <span className="text-xl font-bold">VidTube</span>
                </Link>
            </div>

            <form
                onSubmit={handleSearch}
                className="mx-4 hidden w-full max-w-xl sm:flex"
            >
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search videos"
                    className="w-full rounded-l-full border border-neutral-700 bg-neutral-900 px-5 py-2 outline-none focus:border-blue-500"
                />

                <button
                    type="submit"
                    aria-label="Search"
                    className="rounded-r-full border border-l-0 border-neutral-700 bg-neutral-800 px-5 hover:bg-neutral-700"
                >
                    <Search size={20} />
                </button>
            </form>

            <div className="flex items-center gap-2">
                {!loading && user && (
                    <>
                        <Link
                            to="/upload"
                            className="rounded-full p-2 hover:bg-neutral-800"
                            title="Upload video"
                        >
                            <Video size={23} />
                        </Link>

                        <button
                            type="button"
                            className="rounded-full p-2 hover:bg-neutral-800"
                            title="Notifications"
                            aria-label="Notifications"
                        >
                            <Bell size={22} />
                        </button>

                        {username ? (
                            <Link
                                to={`/channel/${encodeURIComponent(username)}`}
                                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-neutral-700"
                                title="Your channel"
                            >
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt="Your profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="font-semibold">
                                        {username.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </Link>
                        ) : (
                            <span
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-700"
                                title="Profile unavailable"
                            >
                                <UserRound size={22} />
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="flex items-center gap-2 rounded-full border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800 disabled:opacity-50"
                            title="Logout"
                        >
                            <LogOut size={18} />
                            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
                        </button>
                    </>
                )}

                {!loading && !user && (
                    <Link
                        to="/login"
                        className="rounded-full border border-neutral-600 px-4 py-2 text-sm hover:bg-neutral-800"
                    >
                        Sign in
                    </Link>
                )}
            </div>
        </header>
    );
}

export default Navbar;
