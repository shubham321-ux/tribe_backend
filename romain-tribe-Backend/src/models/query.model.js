import mongoose from "mongoose";

const querySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [
        /^[0-9]{10,15}$/,
        "Please provide a valid phone number (10-15 digits)",
      ],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      default: "PENDING",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    respondedAt: {
      type: Date,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
querySchema.index({ email: 1, createdAt: -1 });
querySchema.index({ status: 1, priority: -1 });
querySchema.index({ createdAt: -1 });

// Method to mark as resolved
querySchema.methods.markAsResolved = async function () {
  this.status = "RESOLVED";
  this.respondedAt = new Date();
  return this.save();
};

// Static method to get queries by status
querySchema.statics.getByStatus = function (status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

const Query = mongoose.model("Query", querySchema);

export default Query;