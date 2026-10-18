
const formatViews = (views) => {
    if (views === null || views === undefined || isNaN(views) || views < 0) {
        return "0 views";
    }

    const count = Number(views);

    if (count >= 1000000000) {
        return `${(count / 1000000000).toFixed(1).replace(/\.0$/, "")}B views`;
    }

    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1).replace(/\.0$/, "")}M views`;
    }

    if (count >= 1000) {
        return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K views`;
    }

    return `${count.toLocaleString("en-IN")} views`;
};

export default formatViews;
