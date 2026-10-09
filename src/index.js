
import dotenv from "dotenv"
import connectDB from "./db/index.js";

// Configure dotenv to read variables from the './env' file.
// By default, dotenv looks for a '.env' file in the root, but here we specify a custom path.
dotenv.config({
    path: './.env'
})

// Call the connectDB function to establish a MongoDB connection.
// Since connectDB returns a Promise, we use .then() and .catch() for handling success and failure.
connectDB()
.then(() => {
    // If DB connection is successful, start the Express server.
    // process.env.PORT → environment variable for port number.
    // If not defined, fallback to 8000.
    app.listen(process.env.PORT || 8000, () => {
        // Log a message confirming the server is running.
        console.log(`Server is running at port : ${process.env.PORT}`)
    })
})
.catch((err) => {
    // If DB connection fails, log the error message.
    console.log("❌ MONGO DB connection failed", err)
})
