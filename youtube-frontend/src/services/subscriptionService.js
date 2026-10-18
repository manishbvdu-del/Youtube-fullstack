
import api from "../api/axios";

const SubscriptionService = {
    // Subscribe or unsubscribe from a channel
    toggleSubscription: async (channelId) => {
        const response = await api.post(`/subscriptions/c/${channelId}`);
        return response.data;
    },

    // Get subscribers of a channel
    getChannelSubscribers: async (channelId) => {
        const response = await api.get(
            `/subscriptions/c/${channelId}/subscribers`
        );
        return response.data;
    },

    // Get channels subscribed to by a user
    getSubscribedChannels: async (subscriberId) => {
        const response = await api.get(
            `/subscriptions/u/${subscriberId}`
        );
        return response.data;
    },

    // Check whether the current user is subscribed to a channel
    checkSubscription: async (channelId) => {
        const response = await api.get(
            `/subscriptions/c/${channelId}/status`
        );
        return response.data;
    }
};

export default SubscriptionService;
