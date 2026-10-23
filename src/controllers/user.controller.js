
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (err) {
        console.error("Token generation error:", err);

        if (err instanceof ApiError) {
            throw err;
        }

        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token"
        );
    }
};



const registerUser = asyncHandler(async (req, res) => {

    // get user details from frontend
    // validation - not empty
    // check if user already exists : username ,email
    // check for images ,check for avatar
    // upload them to cloudinary , avatar
    // create user object -> create entry in db
    // remove password and refresh token from field from response
    // check for user creation
    // return res

    const { fullname, email, username, password } = req.body;
    console.log("Email", email);

    if (
        [fullname, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(
            409,
            "User with email or username already exists"
        );
    }

    console.log("Content-Type:", req.headers["content-type"]);
console.log("Request files:", req.files);
console.log("Request body:", req.body);
     
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            createdUser,
            "User registered successfully"
        )
    );
});


const loginUser = asyncHandler(async (req, res) => {

    // req body => data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookies
      console.log("URL:", req.originalUrl);
    console.log("Method:", req.method);
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Body:", req.body);

    const { email, username, password } = req.body || {};


console.log("Login body:", req.body);
console.log("Email:", email);
console.log("Username:", username);
console.log("Password received:", Boolean(password));

    if (!password || (!username && !email)) {
        throw new ApiError(
            400,
            "Username/email and password are required"
        );
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");

    
const options = {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
};


    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});


const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
};

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out"
            )
        );
});

const refreshAccessToken = asyncHandler(async(req,res) =>{
    const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    try{
        const decodedToken  = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }

        if(incomingRefreshToken != user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }

       const options = {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
};

        const {accessToken,refreshToken} =  await generateAccessAndRefreshTokens(user._id)
        return res.status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",refreshToken,options)
            .json(
                new ApiResponse (200,{accessToken,refreshToken},
                    "Access token refreshed"
                )
            )
    }catch(error){
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }

})

const changecurrentUserPassword = asyncHandler(async(req,res) =>{
    const {oldPassword,newPassword} = req.body

    const user = await  User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,{},"password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res) =>{
    return res.status(200)
    .json(new ApiResponse(200,req.user,"current user fetched successfully"))
})

const uploadAccountDetails = asyncHandler(async(req,res) =>{
    const {fullname,email} = req.body

    if(!fullname || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
    {
        $set:{
            fullname:fullname,
            email:email
        }
    },
    {new:true}

    ).select("-password")
    return res.status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res) =>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avator file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }

    const user =   await User.findByIdAndUpdate(req.user._id,{ 
        $set: {
            avatar:avatar.url
        }
        },
        {new:true}
    ).select("-password")
    return res.status(200).json(new ApiResponse(200,user,"avatar updated sucessfully"))
})

const updateUserCoverImage = asyncHandler(async(req,res) =>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image file is missing")
    }
    const coverImage =await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on image")
    }

    const user =  await User.findByIdAndUpdate(req.user._id,{ 
        $set: {
            coverImage :coverImage.url
        }
        },
        {new:true}
    ).select("-password")
    return res.status(200).json(new ApiResponse(200,user,"Cover image updated sucessfully"))
})


const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username.trim().toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $in: [
                        req.user._id,
                        "$subscribers.subscriber"
                    ]
                }
            }
        },
        {
            $project: {
                _id: 1,
                fullname: 1,
                username: 1,
                subscriberCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1
            }
        }
    ]);

    if (!channel.length) {
        throw new ApiError(404, "Channel does not exist");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            channel[0],
            "User channel profile fetched successfully"
        )
    );
});



const getWatchHistory = asyncHandler(async(req,res) =>{
    const user = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)

            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from :"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            user[0]?.watchHistory,
            "Watch history fetched successfully"
        )
    )
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changecurrentUserPassword,
    getCurrentUser,
    uploadAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
};

