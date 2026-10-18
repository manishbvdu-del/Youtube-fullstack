import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // your Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY,       // your Cloudinary API key
  api_secret: process.env.CLOUDINARY_API_SECRET, // your Cloudinary API secret
});

// 📤 Function to upload a local file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    // If no file path is provided, return null (nothing to upload)
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    // resource_type:"auto" → Cloudinary will automatically detect file type (image, video, etc.)
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });

    // // ✅ If upload succeeds, log the Cloudinary URL of the file
    // console.log("File is uploaded on Cloudinary:", response.url);
fs.unlinkSync(localFilePath);
    // Return the full response object (contains details like URL, public_id, etc.)
    return response;

  } catch (error) {
    // ❌ If upload fails, delete the local file to avoid keeping failed uploads
    fs.unlinkSync(localFilePath); // remove locally file as the uplaod operation got failed

    // Return null to indicate failure
    return null;
  }
}

// Export the function so it can be used in other files
export { uploadOnCloudinary }


// // Example: Upload an image
// cloudinary.uploader.upload('path/to/local/image.png', (error, result) => {
//   if (error) {
//     console.error(error);
//   } else {
//     console.log('Uploaded image URL:', result.secure_url);
//   }
// });