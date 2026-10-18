import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";


const createTweet = asyncHandler(async(req,res) => {

    const {content} = req.body

    if(!content){
        throw new ApiError(400,"Content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner:req.user._id
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201,
            tweet,
            "Tweet created successfully")
    )
})


const getAllTweets = asyncHandler(async(req,res) => {

    const tweets = await Tweet.find()
    .populate("owner",
        "username fullName avatar")
    .sort({createdAt:-1})

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            tweets,
            "Tweets fetched successfully")
    )
})


const getTweetById = asyncHandler(async(req,res) => {

    const {tweetId} = req.params

    const tweet = await Tweet.findById(tweetId)
    .populate("owner","username fullName avatar")

    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            tweet,
            "Tweet fetched successfully")
    )
})


const updateTweet = asyncHandler(async(req,res) => {

    const {tweetId} = req.params
    const {content} = req.body

    if(!content){
        throw new ApiError(400,"Content is required")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }

    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not allowed to update this tweet")
    }

    tweet.content = content

    await tweet.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            tweet,
            "Tweet updated successfully")
    )
})


const deleteTweet = asyncHandler(async(req,res) => {

    const {tweetId} = req.params

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }

    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not allowed to delete this tweet")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            {},
            "Tweet deleted successfully")
    )
})


export {
    createTweet,
    getAllTweets,
    getTweetById,
    updateTweet,
    deleteTweet
}