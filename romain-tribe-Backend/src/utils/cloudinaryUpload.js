export const uploadToCloudinary = (file, folder) => {
  if (!file || !file.buffer) {
    throw new Error("Invalid file buffer");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};
