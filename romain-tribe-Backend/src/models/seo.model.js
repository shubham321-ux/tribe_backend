import mongoose from "mongoose";

export default mongoose.model("Seo", new mongoose.Schema({
  page: { type: String, unique: true },
  title: String,
  description: String,
  keywords: [String],
  ogImage: String
}));
