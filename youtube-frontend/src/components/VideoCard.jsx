
import { Link } from "react-router-dom";

function VideoCard({ video }) {
    return (
        <Link to={`/watch/${video._id}`} className="block min-w-0">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-neutral-800">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition duration-200 hover:scale-105"
                />

                {video.duration != null && (
                    <span className="absolute bottom-2 right-2 rounded bg-black/90 px-2 py-1 text-xs">
                        {Math.floor(video.duration / 60)}:
                        {String(video.duration % 60).padStart(2, "0")}
                    </span>
                )}
            </div>

            <div className="mt-3">
                <h3 className="line-clamp-2 font-semibold">
                    {video.title}
                </h3>

                <p className="mt-2 text-sm text-neutral-400">
                    {video.owner?.username || "VidTube creator"}
                </p>

                <p className="mt-1 text-sm text-neutral-400">
                    {Number(video.views || 0).toLocaleString()} views
                </p>
            </div>
        </Link>
    );
}

export default VideoCard;
