import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      public_id: String,
      url: String,
    },

    category: {
      type: String,
      enum: ["travel", "updates", "offers", "general"],
      default: "general",
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin or sub-admin
    },
  },
  { timestamps: true }
);

// auto slug
newsSchema.pre("save", function () {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});


export default mongoose.model("News", newsSchema);
