
import { useParams } from "react-router-dom";

function WatchVideo() {
    const { videoId } = useParams();

    return (
        <div className="max-w-5xl">
            <div className="flex aspect-video items-center justify-center rounded-xl bg-neutral-900">
                <p className="text-neutral-400">Video player coming next</p>
            </div>

            <h1 className="mt-5 text-xl font-bold">
                Watch Video
            </h1>

            <p className="mt-2 text-sm text-neutral-400">
                Video ID: {videoId}
            </p>
        </div>
    );
}

export default WatchVideo;
