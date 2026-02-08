import mongoose from "mongoose";

const TripSchema = new mongoose.Schema(
  {
    title: String,

    images: [String],

    autoSlideDelay: Number,
    rating: Number,
    reviews: Number,

    persons: String,
    area: String,

    price: Number,
    description: String,

    isColumn: Boolean,
    isActive: { type: Boolean, default: true },

    attachments: [String],

    // ✅ NEW: Trip Features / Amenities
    amenities: {
      toilet: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      food: { type: Boolean, default: false },
      ac: { type: Boolean, default: false },
      guide: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      medicalKit: { type: Boolean, default: false },
      pickupDrop: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Trip", TripSchema);
