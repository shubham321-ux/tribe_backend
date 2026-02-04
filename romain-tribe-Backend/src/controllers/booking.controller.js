import Booking from "../models/booking.model.js";
import { transporter } from "../config/mail.js";

export const createBooking = async (req, res) => {
  const booking = await Booking.create(req.body);

  await transporter.sendMail({
    to: process.env.ADMIN_EMAIL,
    subject: "New Trip Booking",
    html: `<h3>${booking.name} booked a trip</h3>`
  });

  res.status(201).json({ message: "Booking successful" });
};

export const getAllBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      date,
    } = req.query;

    const skip = (page - 1) * limit;

    // 🔍 Search & Filter
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);

      query.createdAt = { $gte: start, $lt: end };
    }

    // 🚀 Query DB
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("trip", "title price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      Booking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: "All bookings fetched successfully",
      data: bookings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};


export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ["PENDING", "CONFIRMED", "CANCELLED"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update booking status",
    });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id).lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
    });
  }
};