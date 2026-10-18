import {Router} from "express";
import {
    getAllVideos,
    getVideoById,
    uploadVideo,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    incrementViews
} from "../controllers/video.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/").get(getAllVideos)

router.route("/:videoId").get(getVideoById)

router.route("/:videoId/views").patch(incrementViews)

router.use(verifyJWT)

router.route("/upload").post(
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    uploadVideo
)

router.route("/:videoId").patch(
    upload.fields([
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    updateVideo
)

router.route("/:videoId").delete(deleteVideo)

router.route("/:videoId/toggle-publish").patch(togglePublishStatus)

export default router

