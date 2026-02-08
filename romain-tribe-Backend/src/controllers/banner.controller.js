import Banner from "../models/banner.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

/**
 * CREATE BANNER
 */
export const createBanner = async (req, res) => {
  try {
    const image = req.files?.image?.[0];
    const mobileImage = req.files?.mobileImage?.[0];

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Banner image is required",
      });
    }

    // Upload main image
    const imageResult = await uploadToCloudinary(image.buffer, "banners");

    // Upload mobile image if provided
    let mobileImageUrl = null;
    if (mobileImage) {
      const mobileResult = await uploadToCloudinary(
        mobileImage.buffer,
        "banners/mobile"
      );
      mobileImageUrl = mobileResult.secure_url;
    }

    // Parse and clean data
    const bannerData = { ...req.body };

    // Convert numeric fields
    if (bannerData.displayOrder) {
      bannerData.displayOrder = Number(bannerData.displayOrder);
    }

    // Convert boolean
    if (bannerData.isActive !== undefined) {
      bannerData.isActive = bannerData.isActive === "true" || bannerData.isActive === true;
    }

    // Parse dates
    if (bannerData.startDate) {
      bannerData.startDate = new Date(bannerData.startDate);
    }
    if (bannerData.endDate) {
      bannerData.endDate = new Date(bannerData.endDate);
    }

    const banner = await Banner.create({
      ...bannerData,
      image: imageResult.secure_url,
      mobileImage: mobileImageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (err) {
    console.error("Create Banner Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET ALL BANNERS (Admin)
 */
export const getAllBanners = async (req, res) => {
  try {
    const { position, isActive, page = 1, limit = 10 } = req.query;

    const query = {};
    if (position) query.position = position;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const skip = (page - 1) * limit;

    const [banners, total] = await Promise.all([
      Banner.find(query)
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Banner.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: banners.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: banners,
    });
  } catch (error) {
    console.error("Get Banners Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET ACTIVE BANNERS BY POSITION (Public)
 */
export const getActiveBanners = async (req, res) => {
  try {
    const { position = "home" } = req.query;

    const now = new Date();

    const banners = await Banner.find({
      $or: [{ position }, { position: "all" }],
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: { $lte: now } },
          ],
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: now } },
          ],
        },
      ],
    })
      .sort({ displayOrder: 1, createdAt: -1 })
      .select("-clickCount -viewCount")
      .lean();

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    console.error("Get Active Banners Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET SINGLE BANNER
 */
export const getBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error("Get Banner Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPDATE BANNER
 */
export const updateBanner = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // Handle new image upload
    if (req.files?.image?.[0]) {
      const imageResult = await uploadToCloudinary(
        req.files.image[0].buffer,
        "banners"
      );
      updateData.image = imageResult.secure_url;
    }

    // Handle new mobile image upload
    if (req.files?.mobileImage?.[0]) {
      const mobileResult = await uploadToCloudinary(
        req.files.mobileImage[0].buffer,
        "banners/mobile"
      );
      updateData.mobileImage = mobileResult.secure_url;
    }

    // Convert types
    if (updateData.displayOrder) {
      updateData.displayOrder = Number(updateData.displayOrder);
    }
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive === "true" || updateData.isActive === true;
    }
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Update Banner Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE BANNER
 */
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Delete Banner Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * INCREMENT BANNER VIEW COUNT
 */
export const incrementView = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "View count incremented",
    });
  } catch (error) {
    console.error("Increment View Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * INCREMENT BANNER CLICK COUNT
 */
export const incrementClick = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { $inc: { clickCount: 1 } },
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Click count incremented",
    });
  } catch (error) {
    console.error("Increment Click Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * TOGGLE BANNER STATUS
 */
export const toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.status(200).json({
      success: true,
      message: `Banner ${banner.isActive ? "activated" : "deactivated"} successfully`,
      data: banner,
    });
  } catch (error) {
    console.error("Toggle Banner Status Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * REORDER BANNERS
 */
export const reorderBanners = async (req, res) => {
  try {
    const { banners } = req.body; // Array of { id, displayOrder }

    if (!Array.isArray(banners)) {
      return res.status(400).json({
        success: false,
        message: "Banners array is required",
      });
    }

    const updatePromises = banners.map(({ id, displayOrder }) =>
      Banner.findByIdAndUpdate(id, { displayOrder }, { new: true })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Banners reordered successfully",
    });
  } catch (error) {
    console.error("Reorder Banners Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};