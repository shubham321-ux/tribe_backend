import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, required: true },
    content: { type: Object, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Page", pageSchema);
