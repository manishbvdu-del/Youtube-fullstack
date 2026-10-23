
import { Router } from "express";
import { getCommentLikeCount,
     getTweetLikeCount, 
     getVideoLikeCount, 
     
     toggleCommentLike,
      toggleTweetLike, 
      toggleVideoLike } from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)

router.route("/toggle/v/:videoId").post(toggleVideoLike)
router.route("/toggle/c/:commentId").post(toggleCommentLike)
router.route("/toggle/t/:tweetId").post(toggleTweetLike)
router.route("/video/:videoId").get(getVideoLikeCount)
router.route("/comment/:commentId").get(getCommentLikeCount)
router.route("/tweet/:tweetId").get(getTweetLikeCount)


export default router
