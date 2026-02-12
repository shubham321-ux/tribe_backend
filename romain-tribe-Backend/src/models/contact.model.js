import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    // Brand Information
    brandName: {
      type: String,
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
    },

    // Contact Information
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },

    // Social Media Links
    social: {
      instagram: {
        type: String,
        trim: true,
      },
      facebook: {
        type: String,
        trim: true,
      },
      twitter: {
        type: String,
        trim: true,
      },
      youtube: {
        type: String,
        trim: true,
      },
      linkedin: {
        type: String,
        trim: true,
      },
    },

    // Footer Content
    footerText: {
      type: String,
      trim: true,
    },
    copyrightText: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Contact", contactSchema);