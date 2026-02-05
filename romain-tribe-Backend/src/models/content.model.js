import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    brandName: String,
    tagline: String,

    contact: {
      email: String,
      phone: String,
      whatsapp: String,
      address: String,
    },

    social: {
      instagram: String,
      facebook: String,
      twitter: String,
      youtube: String,
      linkedin: String,
    },

    footerText: String,
    copyrightText: String,
  },
  { timestamps: true }
);

export default mongoose.model("Content", contentSchema);
