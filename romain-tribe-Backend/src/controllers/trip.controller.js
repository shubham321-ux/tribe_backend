import Trip from "../models/trip.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export const createTrip = async (req, res) => {
  try {
    console.log("req.files =", req.files);
    console.log("req.body =", req.body);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const imageUrls = [];

    for (const file of req.files) {
      if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
        return res.status(400).json({ message: "Invalid file buffer" });
      }

      const uploaded = await uploadToCloudinary(
        file.buffer,          // IMPORTANT
        "travel/trips"
      );

      imageUrls.push(uploaded.secure_url);
    }

    const trip = await Trip.create({
      ...req.body,
      images: imageUrls
    });

    res.status(201).json({
      message: "Trip created successfully",
      trip
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating trip",
      error: error.message
    });
  }
};



export const getTrips = async (req, res) => {
  const trips = await Trip.find({ isActive: true }).lean();
  res.json(trips);
};

export const updateTrip = async (req, res) => {
  const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(trip);
};

export const deleteTrip = async (req, res) => {
  await Trip.findByIdAndDelete(req.params.id);
  res.json({ message: "Trip deleted" });
};
