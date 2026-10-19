
import api from "../api/axios";

const TweetService = {
    // Get all tweets
    getAllTweets: async () => {
        const response = await api.get("/tweets");
        return response.data;
    },

    // Create a tweet
    createTweet: async (data) => {
        const response = await api.post("/tweets/create", data);
        return response.data;
    },

    // Get tweet by ID
    getTweetById: async (tweetId) => {
        const response = await api.get(`/tweets/${tweetId}`);
        return response.data;
    },

    // Update a tweet
    updateTweet: async (tweetId, data) => {
        const response = await api.patch(`/tweets/${tweetId}`, data);
        return response.data;
    },

    // Delete a tweet
    deleteTweet: async (tweetId) => {
        const response = await api.delete(`/tweets/${tweetId}`);
        return response.data;
    }
};

export default TweetService;
