import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";


const createPlaylist = asyncHandler(async(req,res) => {

    const {name,description} = req.body

    if(!name || !description){
        throw new ApiError(400,"Name and description are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner:req.user._id,
        videos:[]
    })

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            playlist,
            "Playlist created successfully"
        )
    )
})


const getUserPlaylists = asyncHandler(async(req,res) => {

    const {userId} = req.params

    const playlists = await Playlist.find({
        owner:userId
    })
    .populate("videos","title thumbnail")
    .populate("owner","username fullname avatar")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlists,
            "Playlists fetched successfully"
        )
    )
})


const getPlaylistById = asyncHandler(async(req,res) => {

    const {playlistId} = req.params

    const playlist = await Playlist.findById(playlistId)
        .populate("videos","title thumbnail duration")
        .populate("owner","username fullname avatar")

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        )
    )
})


const updatePlaylist = asyncHandler(async(req,res) => {

    const {playlistId} = req.params
    const {name,description} = req.body

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(
            403,
            "You are not allowed to update this playlist"
        )
    }

    if(name){
        playlist.name = name
    }

    if(description){
        playlist.description = description
    }

    await playlist.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist updated successfully"
        )
    )
})


const deletePlaylist = asyncHandler(async(req,res) => {

    const {playlistId} = req.params

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(
            403,
            "You are not allowed to delete this playlist"
        )
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Playlist deleted successfully"
        )
    )
})


const addVideoToPlaylist = asyncHandler(async(req,res) => {

    const {playlistId,videoId} = req.params

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(
            403,
            "You are not allowed to modify this playlist"
        )
    }

    if(playlist.videos.includes(videoId)){
        throw new ApiError(400,"Video already exists in playlist")
    }

    playlist.videos.push(videoId)

    await playlist.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Video added to playlist successfully"
        )
    )
})


const removeVideoFromPlaylist = asyncHandler(async(req,res) => {

    const {playlistId,videoId} = req.params

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(
            403,
            "You are not allowed to modify this playlist"
        )
    }

    playlist.videos = playlist.videos.filter(
        (video) => video.toString() !== videoId
    )

    await playlist.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Video removed from playlist successfully"
        )
    )
})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist
}