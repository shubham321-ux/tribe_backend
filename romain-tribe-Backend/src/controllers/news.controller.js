import News from "../models/news.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export const createNews = async (req, res) => {
  try {
    console.log("req.file =", req.file);
    console.log("req.body =", req.body);

    let image = {};

    if (req.file) {
      if (!req.file.buffer || !Buffer.isBuffer(req.file.buffer)) {
        return res.status(400).json({ message: "Invalid image buffer" });
      }

      const uploaded = await uploadToCloudinary(
        req.file.buffer,
        "news"
      );

      image = {
        public_id: uploaded.public_id,
        url: uploaded.secure_url,
      };
    }

    const news = await News.create({
      ...req.body,
      image,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: "News created successfully",
      data: news,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllNews = async (req, res) => {
  try {
    const news = await News.find({ isPublished: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNewsBySlug = async (req, res) => {
  try {
    const news = await News.findOne({ slug: req.params.slug });

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateNews = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.file) {
      if (!req.file.buffer || !Buffer.isBuffer(req.file.buffer)) {
        return res.status(400).json({ message: "Invalid image buffer" });
      }

      const uploaded = await uploadToCloudinary(
        req.file.buffer,
        "news"
      );

      updateData.image = {
        public_id: uploaded.public_id,
        url: uploaded.secure_url,
      };
    }

    const news = await News.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "News updated successfully",
      data: news,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteNews = async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "News deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
