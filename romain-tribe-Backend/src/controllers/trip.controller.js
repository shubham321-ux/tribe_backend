import Trip from "../models/trip.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export const createTrip = async (req, res) => {
  const imageUrls = [];

  for (const file of req.files) {
    const uploaded = await uploadToCloudinary(file, "travel/trips");
    imageUrls.push(uploaded.secure_url);
  }

  const trip = await Trip.create({
    ...req.body,
    images: imageUrls
  });

  res.status(201).json(trip);
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
