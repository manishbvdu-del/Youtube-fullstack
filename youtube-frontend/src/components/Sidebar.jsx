
import {
    Home,
    History,
    ThumbsUp,
    ListVideo,
    UserRound,
    Clapperboard
} from "lucide-react";

const items = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Subscriptions", icon: Clapperboard, path: "/subscriptions" },
    { label: "History", icon: History, path: "/history" },
    { label: "Playlists", icon: ListVideo, path: "/playlists" },
    { label: "Liked videos", icon: ThumbsUp, path: "/liked-videos" },
    { label: "Your channel", icon: UserRound, path: "/channel" }
];

function Sidebar({ open }) {
    if (!open) return null;

    return (
        <aside className="fixed bottom-0 left-0 top-16 z-40 w-60 overflow-y-auto bg-[#0f0f0f] p-3">
            {items.map(({ label, icon: Icon, path }) => (
                <a
                    key={label}
                    href={path}
                    className={`flex items-center gap-5 rounded-lg px-4 py-3 hover:bg-neutral-800 ${
                        path === "/" ? "bg-neutral-800" : ""
                    }`}
                >
                    <Icon size={22} />
                    <span className="text-sm">{label}</span>
                </a>
            ))}

            <hr className="my-4 border-neutral-800" />

            <p className="px-4 text-sm text-neutral-400">
                Sign in to like videos, comment, and subscribe.
            </p>
        </aside>
    );
}

export default Sidebar;
