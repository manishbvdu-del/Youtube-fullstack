import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";


const addComment = asyncHandler(async(req,res) => {

    const {videoId} = req.params
    const {content} = req.body

    if(!content){
        throw new ApiError(400,"Comment content is required")
    }

    const comment = await Comment.create({
        content,
        video:videoId,
        owner:req.user._id
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201,comment,"Comment added successfully")
    )
})


const getVideoComments = asyncHandler(async(req,res) => {

    const {videoId} = req.params

    const comments = await Comment.find({
        video:videoId
    })
    .populate("owner","username fullName avatar")
    .sort({createdAt:-1})

    return res
    .status(200)
    .json(
        new ApiResponse(200,comments,"Comments fetched successfully")
    )
})


const updateComment = asyncHandler(async(req,res) => {

    const {commentId} = req.params
    const {content} = req.body

    if(!content){
        throw new ApiError(400,"Comment content is required")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404,"Comment not found")
    }

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not allowed to update this comment")
    }

    comment.content = content

    await comment.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"Comment updated successfully")
    )
})


const deleteComment = asyncHandler(async(req,res) => {

    const {commentId} = req.params

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404,"Comment not found")
    }

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not allowed to delete this comment")
    }

    await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Comment deleted successfully")
    )
})


export {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment
}