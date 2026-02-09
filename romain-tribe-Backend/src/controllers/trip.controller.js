import Trip from "../models/trip.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

/**
 * CREATE TRIP
 */
export const createTrip = async (req, res) => {
  try {
    const images = req.files?.images || [];
    const attachments = req.files?.attachments || [];

    const imageUrls = [];
    const attachmentUrls = [];

    for (const file of images) {
      const result = await uploadToCloudinary(file.buffer, "trips/images");
      imageUrls.push(result.secure_url);
    }

    for (const file of attachments) {
      const result = await uploadToCloudinary(file.buffer, "trips/attachments");
      attachmentUrls.push(result.secure_url);
    }

    const tripData = Object.keys(req.body).reduce((acc, key) => {
      const cleanKey = key.trim(); 
      let value = req.body[key];
      if (typeof value === 'string') {
        value = value.trim();
        
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        if (value.startsWith('{') || value.startsWith('[')) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            // Not valid JSON, keep as string
          }
        }
      }

      acc[cleanKey] = value;
      return acc;
    }, {});

    // Convert numeric fields
    if (tripData.price) tripData.price = Number(tripData.price);
    if (tripData.rating) tripData.rating = Number(tripData.rating);

    const trip = await Trip.create({
      ...tripData,
      images: imageUrls,
      attachments: attachmentUrls
    });

    res.status(201).json({
      success: true,
      trip
    });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

/**
 * GET ACTIVE TRIPS
 */
export const getTrips = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter parameters
    const filter = { isActive: true };
    
    // Search functionality
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Get total count
    const totalTrips = await Trip.countDocuments(filter);

    // Get paginated trips
    const trips = await Trip.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(totalTrips / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: trips,
      pagination: {
        currentPage: page,
        totalPages,
        totalTrips,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/**
 * UPDATE TRIP (optional image replace)
 */
export const updateTrip = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.body.price) updateData.price = Number(req.body.price);
    if (req.body.rating) updateData.rating = Number(req.body.rating);
    if (req.body.isActive)
      updateData.isActive = req.body.isActive === "true";

    if (req.body.amenities) {
      updateData.amenities =
        typeof req.body.amenities === "string"
          ? JSON.parse(req.body.amenities)
          : req.body.amenities;
    }

    // ✅ FIX: Handle images from upload.fields()
    if (req.files?.images && req.files.images.length > 0) {
      const imageUrls = [];

      for (const file of req.files.images) {
        const uploaded = await uploadToCloudinary(file, "travel/trips");
        imageUrls.push(uploaded.secure_url);
      }

      updateData.images = imageUrls;
    }

    // ✅ Handle attachments if needed
    if (req.files?.attachments && req.files.attachments.length > 0) {
      const attachmentUrls = [];

      for (const file of req.files.attachments) {
        const uploaded = await uploadToCloudinary(file, "trips/attachments");
        attachmentUrls.push(uploaded.secure_url);
      }

      updateData.attachments = attachmentUrls;
    }

    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      data: trip,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE TRIP
 */
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
