import mongoose from "mongoose";

export default mongoose.model("Booking", new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  name: String,
  email: String,
  phone: String,
  date: Date,
  persons: Number,
  message: String,
  status: { type: String, default: "PENDING" }
}, { timestamps: true }));
