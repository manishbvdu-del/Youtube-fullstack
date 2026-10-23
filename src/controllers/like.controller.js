import mongoose from "mongoose";
import {Like} from "../models/like.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async(req,res) =>{

    const {videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    const existingLike = await Like.findOne({
        video:videoId,
        likedBy:req.user._id
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)

        return res.status(200).json(
            new ApiResponse(200,{liked:false},"Video unliked successfully")
        )
    }

    const like = await Like.create({
        video:videoId,
        likedBy:req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201,{liked:true,like},"Video liked successfully")
    )
})

const toggleCommentLike = asyncHandler(async(req,res) =>{

    const {commentId} = req.params

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid comment id")
    }

    const existingLike = await Like.findOne({
        comment:commentId,
        likedBy:req.user._id
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)

        return res.status(200).json(
            new ApiResponse(200,{liked:false},"Comment unliked successfully")
        )
    }

    const like = await Like.create({
        comment:commentId,
        likedBy:req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201,{liked:true,like},"Comment liked successfully")
    )
})

const toggleTweetLike = asyncHandler(async(req,res) =>{

    const {tweetId} = req.params

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Invalid tweet id")
    }

    const existingLike = await Like.findOne({
        tweet:tweetId,
        likedBy:req.user._id
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)

        return res.status(200).json(
            new ApiResponse(200,{liked:false},"Tweet unliked successfully")
        )
    }

    const like = await Like.create({
        tweet:tweetId,
        likedBy:req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201,{liked:true,like},"Tweet liked successfully")
    )
})

const getVideoLikeCount = asyncHandler(async(req,res) =>{
    const {videoId} = req.params
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    const likeCount = await Like.countDocuments({
        video:videoId
    })

    const isLiked = await Like.exists({
        video:videoId,
        likedBy:req.user._id
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                likeCount,
                isLiked:!!isLiked
            },
            "Video like details fetched successfully"
        )
    )
})

const getCommentLikeCount = asyncHandler(async(req,res) =>{

    const {commentId} = req.params

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"Invalid comment id")
    }

    const likeCount = await Like.countDocuments({
        comment:commentId
    })

    const isLiked = await Like.exists({
        comment:commentId,
        likedBy:req.user._id
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                likeCount,
                isLiked:!!isLiked
            },
            "Comment like details fetched successfully"
        )
    )
})

const getTweetLikeCount = asyncHandler(async(req,res) =>{

    const {tweetId} = req.params

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"Invalid tweet id")
    }

    const likeCount = await Like.countDocuments({
        tweet:tweetId
    })

    const isLiked = await Like.exists({
        tweet:tweetId,
        likedBy:req.user._id
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                likeCount,
                isLiked:!!isLiked
            },
            "Tweet like details fetched successfully"
        )
    )
})
const getLikedVideos = asyncHandler(async(req,res) =>{

    const likedVideos = await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(req.user._id),
                video:{$exists:true,$ne:null}
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"videoDetails"
            }
        },
        {
            $unwind:"$videoDetails"
        },
        {
            $replaceRoot:{
                newRoot:"$videoDetails"
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            likedVideos,
            "Liked videos fetched successfully"
        )
    )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getVideoLikeCount,
    getCommentLikeCount,
    getTweetLikeCount
}