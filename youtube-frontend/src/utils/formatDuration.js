
const formatDuration = (duration) => {
    if (duration === null || duration === undefined || isNaN(duration) || duration < 0) {
        return "00:00";
    }

    const totalSeconds = Math.floor(Number(duration));

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default formatDuration;
