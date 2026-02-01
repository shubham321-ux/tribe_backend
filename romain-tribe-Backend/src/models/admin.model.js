import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["ADMIN", "SUB_ADMIN"],
      default: "SUB_ADMIN",
    },

    permissions: {
      type: [String],
      default: [],
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
