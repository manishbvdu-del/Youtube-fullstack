import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Define an async function to connect to MongoDB
const connecDB = async() => {
  try {
    // Try to establish a connection to MongoDB
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );

    // If connection is successful, log the host name
    console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`);
   
  } catch(error) {
    // If connection fails, log the error
    console.log("MONGODB connection failed", error);

    process.exit(1);
  }
}

// Export the connectDB function so it can be used in server.js or app.js
export default connecDB;
