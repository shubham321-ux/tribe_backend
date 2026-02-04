import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const uploadToCloudinary = (buffer, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    // ✅ SAFETY CHECK (VERY IMPORTANT)
    if (!buffer || !Buffer.isBuffer(buffer)) {
      return reject(new Error("Invalid file buffer"));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // ✅ STREAM ERROR HANDLING
    uploadStream.on("error", reject);

    // ✅ ONLY buffer goes here
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
