import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (file, folder) => {
  return cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    { folder, resource_type: "auto" }
  );
};
