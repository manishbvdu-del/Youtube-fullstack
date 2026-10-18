import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import {Like} from "../models/like.model.js";
import {Comment} from "../models/comment.model.js";
import {Subscription} from "../models/subscription.model.js";

const getChannelStats = asyncHandler(async(req,res) =>{
    const {channelId} = req.params
    
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Invalid channel id")
    }

    const totalVideos = await Video.countDocuments({
        owner:channelId
    })

    const totalViews = await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group:{
                _id:null,
                totalViews:{
                    $sum:"$views"
                }
            }
        }
    ])

    const totalLikes = await Like.countDocuments({
        video:{
            $in:await Video.find({
                owner:channelId
            }).distinct("_id")
        }
    })

    const totalComments = await Comment.countDocuments({
        owner:channelId
    })

    const totalSubscribers = await Subscription.countDocuments({
        channel:channelId
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalViews:totalViews[0]?.totalViews || 0,
                totalLikes,
                totalComments,
                totalSubscribers
            },
            "Channel stats fetched successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async(req,res) =>{

    const {channelId} = req.params

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Invalid channel id")
    }

    const videos = await Video.find({
        owner:channelId
    })
    .sort({
        createdAt:-1
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Channel videos fetched successfully"
        )
    )
})

export {
    getChannelStats,
    getChannelVideos
}

