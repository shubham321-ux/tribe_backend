import mongoose from "mongoose";

export default mongoose.model("Page", new mongoose.Schema({
  slug: { type: String, unique: true },
  content: Object
}));
