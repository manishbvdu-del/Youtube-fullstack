
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";


const getAllVideos = asyncHandler(async(req,res) =>{

    const {page = 1,limit = 10,query,sortBy = "createdAt",sortType = "desc",userId} = req.query

    const pageNumber = Math.max(1,Number(page) || 1)
    const limitNumber = Math.max(1,Number(limit) || 10)

    const matchStage = {
        isPublished:true
    }

    if(userId){
        if(!mongoose.Types.ObjectId.isValid(userId)){
            throw new ApiError(400,"Invalid userId")
        }

        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }

    if(query){
        matchStage.$or = [
            {
                title:{
                    $regex:query,
                    $options:"i"
                }
            },
            {
                description:{
                    $regex:query,
                    $options:"i"
                }
            }
        ]
    }

    const sortStage = {}
    sortStage[sortBy] = sortType === "asc" ? 1 : -1

    const videos = await Video.aggregate([
        {
            $match:matchStage
        },
        {
            $sort:sortStage
        },
        {
            $skip:(pageNumber - 1) * limitNumber
        },
        {
            $limit:limitNumber
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },
        {
            $unwind:"$owner"
        },
        {
            $project:{
                videoFile:1,
                thumbnail:1,
                title:1,
                description:1,
                duration:1,
                views:1,
                isPublished:1,
                createdAt:1,
                owner:{
                    _id:"$owner._id",
                    username:"$owner.username",
                    avatar:"$owner.avatar"
                }
            }
        }
    ])

    const totalVideos = await Video.countDocuments(matchStage)

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                currentPage:pageNumber,
                totalPages:Math.ceil(totalVideos / limitNumber),
                totalVideos
            },
            "Videos fetched successfully"
        )
    )
})


const getVideoById = asyncHandler(async(req,res) =>{

    const {videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    const foundVideo = await Video.findById(videoId)
        .populate("owner","username avatar")

    if(!foundVideo){
        throw new ApiError(404,"Video not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            foundVideo,
            "Video fetched successfully"
        )
    )
})

const uploadVideo = asyncHandler(async(req,res) =>{

    const {title,description,duration} = req.body

    if(!title || !description || !duration){
        throw new ApiError(400,"Title, description and duration are required")
    }

    if(!req.files?.videoFile?.[0]){
        throw new ApiError(400,"Video file is required")
    }

    if(!req.files?.thumbnail?.[0]){
        throw new ApiError(400,"Thumbnail file is required")
    }

    const videoFileLocalPath = req.files.videoFile[0].path
    const thumbnailLocalPath = req.files.thumbnail[0].path

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoFile){
        throw new ApiError(400,"Error while uploading video")
    }

    if(!thumbnail){
        throw new ApiError(400,"Error while uploading thumbnail")
    }

    const newVideo = await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        title,
        description,
        duration,
        owner:req.user._id
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            newVideo,
            "Video uploaded successfully"
        )
    )
})

const updateVideo = asyncHandler(async(req,res) =>{

    const {videoId} = req.params
    const {title,description} = req.body

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    const foundVideo = await Video.findById(videoId)

    if(!foundVideo){
        throw new ApiError(404,"Video not found")
    }

    if(foundVideo.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not allowed to update this video")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                description
            }
        },
        {
            new:true
        }
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedVideo,
            "Video updated successfully"
        )
    )
})

const deleteVideo = asyncHandler(async(req,res) =>{

    const {videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    const foundVideo = await Video.findById(videoId)

    if(!foundVideo){
        throw new ApiError(404,"Video not found")
    }

    if(foundVideo.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not allowed to delete this video")
    }

    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Video deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async(req,res) =>{

    const {videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    const foundVideo = await Video.findById(videoId)

    if(!foundVideo){
        throw new ApiError(404,"Video not found")
    }

    if(foundVideo.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,
            "You are not allowed to modify this video")
    }

    foundVideo.isPublished = !foundVideo.isPublished

    await foundVideo.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            foundVideo,
            "Video publish status updated successfully"
        )
    )
})

const incrementViews = asyncHandler(async(req,res) =>{

    const {videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video id")
    }

    const foundVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc:{
                views:1
            }
        },
        {
            new:true
        }
    )

    if(!foundVideo){
        throw new ApiError(404,"Video not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                views:foundVideo.views
            },
            "Video view updated successfully"
        )
    )
})

export {
    getAllVideos,
    getVideoById,
    uploadVideo,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    incrementViews
}
