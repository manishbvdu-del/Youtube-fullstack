import { Router } from "express";

import {
    toggleSubscription,
    getChannelSubscribers,
    getSubscribedChannels,
    checkSubscription
} from "../controllers/subscription.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()


router.route("/c/:channelId")
    .post(verifyJWT,toggleSubscription)


router.route("/c/:channelId/subscribers")
    .get(getChannelSubscribers)


router.route("/u/:subscriberId")
    .get(getSubscribedChannels)


router.route("/c/:channelId/status")
    .get(verifyJWT,checkSubscription)


export default router