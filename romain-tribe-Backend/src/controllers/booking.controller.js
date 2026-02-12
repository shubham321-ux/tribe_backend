import Booking from "../models/booking.model.js";
import { transporter } from "../config/mail.js";

export const createBooking = async (req, res) => {
  const booking = await Booking.create(req.body);

  await transporter.sendMail({
    to: process.env.ADMIN_EMAIL,
    subject: "New Trip Booking",
    html: `<h3>${booking.name} booked a trip</h3>
    <h5>Email: ${booking.email}</h5>
    <h5>Email: ${booking?.phone}</h5>`
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
// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    // Get total counts by status
    const [totalBookings, pendingCount, confirmedCount, cancelledCount] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "PENDING" }),
      Booking.countDocuments({ status: "CONFIRMED" }),
      Booking.countDocuments({ status: "CANCELLED" }),
    ]);

    // Get recent bookings (last 10)
    const recentBookings = await Booking.find()
      .populate("trip", "title price")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get bookings by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const bookingsByMonth = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total: totalBookings,
          pending: pendingCount,
          confirmed: confirmedCount,
          cancelled: cancelledCount,
        },
        recentBookings,
        bookingsByMonth,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};