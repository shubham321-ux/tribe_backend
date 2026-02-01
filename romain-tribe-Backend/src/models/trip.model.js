import mongoose from "mongoose";

const TripSchema = new mongoose.Schema({
  title: String,
  images: [String],
  autoSlideDelay: Number,
  rating: Number,
  reviews: Number,
  persons: String,
  area: String,
  isColumn: Boolean,
  attachments: [String],
  description: String,
  price: Number,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Trip", TripSchema);
