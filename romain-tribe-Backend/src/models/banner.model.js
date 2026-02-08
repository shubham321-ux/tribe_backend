import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, "Subtitle cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    image: {
      type: String,
      required: [true, "Banner image is required"],
    },
    mobileImage: {
      type: String, // Optional separate image for mobile
    },
    buttonText: {
      type: String,
      trim: true,
      maxlength: [50, "Button text cannot exceed 50 characters"],
    },
    buttonLink: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      enum: ["home", "trips", "about", "contact", "all"],
      default: "home",
      required: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
bannerSchema.index({ position: 1, isActive: 1, displayOrder: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

// Virtual to check if banner is currently active based on dates
bannerSchema.virtual("isCurrentlyActive").get(function () {
  const now = new Date();
  const isWithinDateRange =
    (!this.startDate || this.startDate <= now) &&
    (!this.endDate || this.endDate >= now);
  return this.isActive && isWithinDateRange;
});

// Method to increment view count
bannerSchema.methods.incrementView = async function () {
  this.viewCount += 1;
  return this.save();
};

// Method to increment click count
bannerSchema.methods.incrementClick = async function () {
  this.clickCount += 1;
  return this.save();
};

// Static method to get active banners by position
bannerSchema.statics.getActiveByPosition = function (position) {
  const now = new Date();
  return this.find({
    $or: [{ position }, { position: "all" }],
    isActive: true,
    $or: [
      { startDate: { $exists: false } },
      { startDate: { $lte: now } },
    ],
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gte: now } },
    ],
  }).sort({ displayOrder: 1, createdAt: -1 });
};

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;