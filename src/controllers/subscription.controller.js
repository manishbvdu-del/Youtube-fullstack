import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";


const toggleSubscription = asyncHandler(async(req,res) => {

    const {channelId} = req.params

    if(req.user._id.toString() === channelId){
        throw new ApiError(400,"You cannot subscribe to yourself")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber:req.user._id,
        channel:channelId
    })

    if(existingSubscription){

        await Subscription.findByIdAndDelete(existingSubscription._id)

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {subscribed:false},
                "Unsubscribed successfully"
            )
        )
    }

    const subscription = await Subscription.create({
        subscriber:req.user._id,
        channel:channelId
    })

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            {subscription,subscribed:true},
            "Subscribed successfully"
        )
    )
})


const getChannelSubscribers = asyncHandler(async(req,res) => {

    const {channelId} = req.params

    const subscribers = await Subscription.find({
        channel:channelId
    })
    .populate("subscriber","username fullname avatar")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscribers,
            "Subscribers fetched successfully"
        )
    )
})


const getSubscribedChannels = asyncHandler(async(req,res) => {

    const {subscriberId} = req.params

    const subscriptions = await Subscription.find({
        subscriber:subscriberId
    })
    .populate("channel","username fullname avatar")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscriptions,
            "Subscribed channels fetched successfully"
        )
    )
})


const checkSubscription = asyncHandler(async(req,res) => {

    const {channelId} = req.params

    const subscription = await Subscription.findOne({
        subscriber:req.user._id,
        channel:channelId
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                subscribed:!!subscription
            },
            "Subscription status fetched successfully"
        )
    )
})


export {
    toggleSubscription,
    getChannelSubscribers,
    getSubscribedChannels,
    checkSubscription
}