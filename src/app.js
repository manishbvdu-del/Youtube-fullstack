
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// Enable CORS for your app.
// origin: specifies which frontend domain is allowed to make requests.
// Credentials: true → allows cookies and authentication headers to be sent.
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// Parse incoming JSON requests.
// limit: restricts the maximum size of JSON payloads to 16kb.
app.use(express.json({ limit: "16kb" }))

// Parse URL-encoded data (form submissions).
// extended: true → allows nested objects.
// limit: restricts payload size to 16kb.
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

// Serve static files from the "public" folder.
// Useful for serving images, CSS, JS files directly.
app.use(express.static("public"))

// Enable cookie parsing.
// This lets you read cookies from incoming requests.
app.use(cookieParser())

// routes
import userRouter from './routes/user.routes.js'
import likeRouter from './routes/like.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
import videoRouter from './routes/video.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import commentRouter from "./routes/comment.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";

// routes declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/dashboard",dashboardRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/tweets",tweetRouter)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)
app.use("/api/v1/playlists",playlistRouter);
app.use("/api/v1/",healthcheckRouter)

export { app }

