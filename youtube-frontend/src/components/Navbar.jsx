
import { Menu, Search, Video, Bell } from "lucide-react";
import { useState } from "react";

function Navbar({ onMenuClick }) {
    const [search, setSearch] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();

        if (search.trim()) {
            window.location.href = `/?search=${encodeURIComponent(search.trim())}`;
        }
    };

    return (
        <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-neutral-800 bg-[#0f0f0f] px-4 md:px-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="rounded-full p-2 hover:bg-neutral-800"
                >
                    <Menu size={24} />
                </button>

                <a href="/" className="flex items-center gap-2">
                    <span className="text-2xl text-red-600">▶</span>
                    <span className="text-xl font-bold">VidTube</span>
                </a>
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
                    className="rounded-r-full border border-l-0 border-neutral-700 bg-neutral-800 px-5 hover:bg-neutral-700"
                >
                    <Search size={20} />
                </button>
            </form>

            <div className="flex items-center gap-2">
                <button className="rounded-full p-2 hover:bg-neutral-800">
                    <Video size={23} />
                </button>

                <button className="rounded-full p-2 hover:bg-neutral-800">
                    <Bell size={23} />
                </button>

                <a
                    href="/login"
                    className="rounded-full border border-neutral-600 px-4 py-2 text-sm hover:bg-neutral-800"
                >
                    Sign in
                </a>
            </div>
        </header>
    );
}

export default Navbar;
