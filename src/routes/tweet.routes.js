import { Router } from "express";
import {
    createTweet,
    getAllTweets,
    getTweetById,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/").get(getAllTweets)
router.route("/create").post(verifyJWT, createTweet)

router.route("/:tweetId").get(getTweetById)
router.route("/:tweetId").patch(verifyJWT, updateTweet)
router.route("/:tweetId").delete(verifyJWT, deleteTweet)


export default router