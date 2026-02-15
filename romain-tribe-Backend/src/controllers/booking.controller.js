import Booking from "../models/booking.model.js";
import { transporter } from "../config/mail.js";

// export const createBooking = async (req, res) => {
//   const booking = await Booking.create(req.body);

//   await transporter.sendMail({
//     to: process.env.ADMIN_EMAIL,
//     subject: "New Trip Booking",
//     html: `<h3>${booking.name} booked a trip</h3>
//     <h5>Email: ${booking.email}</h5>
//     <h5>Email: ${booking?.phone}</h5>`
//   });

//   res.status(201).json({ message: "Booking successful" });
// };
export const createBooking = async (req, res) => {
  try {
    const { name, email, phone, date, persons, message, trip } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !date) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone, and date are required"
      });
    }

    // Create booking
    const booking = await Booking.create({
      trip: trip || null,
      name,
      email,
      phone,
      date,
      persons: persons || 1,
      message: message || "Booking inquiry from website",
      status: "PENDING"
    });

    // Format date for display
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Send email to ADMIN
    try {
      await transporter.sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: "New Trip Booking Received",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
              New Booking Received
            </h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0;"><strong>Phone:</strong> ${phone}</p>
              <p style="margin: 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 10px 0;"><strong>Number of Persons:</strong> ${persons || 1}</p>
              ${trip ? `<p style="margin: 10px 0;"><strong>Trip ID:</strong> ${trip}</p>` : ''}
            </div>
            
            ${message ? `
              <div style="background: white; padding: 20px; border-left: 4px solid #3498db; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Message:</h3>
                <p style="color: #666; line-height: 1.6;">${message}</p>
              </div>
            ` : ''}
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Booking ID: ${booking._id}<br>
              Submitted at: ${new Date().toLocaleString()}
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error("Admin email error:", emailError);
      // Don't fail the request if admin email fails
    }

    // Send CONFIRMATION email to USER
    try {
      await transporter.sendMail({
        to: email,
        subject: "Booking Confirmation - Thank You!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Booking!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Dear <strong>${name}</strong>,
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                We have received your booking request and our team will get back to you shortly. 
                Here are your booking details:
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #333; margin-top: 0; margin-bottom: 15px; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                  Booking Details
                </h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Name:</strong></td>
                    <td style="padding: 8px 0; color: #333;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                    <td style="padding: 8px 0; color: #333;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Phone:</strong></td>
                    <td style="padding: 8px 0; color: #333;">${phone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Preferred Date:</strong></td>
                    <td style="padding: 8px 0; color: #333;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Number of Persons:</strong></td>
                    <td style="padding: 8px 0; color: #333;">${persons || 1}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;"><strong>Booking Reference:</strong></td>
                    <td style="padding: 8px 0; color: #333; font-family: monospace;">#${booking._id.toString().slice(-8).toUpperCase()}</td>
                  </tr>
                </table>
              </div>

              ${message ? `
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                  <p style="margin: 0; color: #856404;"><strong>Your Message:</strong></p>
                  <p style="margin: 10px 0 0 0; color: #856404;">${message}</p>
                </div>
              ` : ''}
              
              <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4caf50;">
                <p style="margin: 0; color: #2e7d32; line-height: 1.6;">
                  <strong>What's Next?</strong><br>
                  Our team will review your booking and contact you within 24-48 hours to confirm availability and discuss further details.
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                If you have any questions or need to make changes to your booking, please don't hesitate to contact us:
              </p>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0; color: #333;">
                  📧 Email: ${process.env.ADMIN_EMAIL || 'support@example.com'}<br>
                  📞 Phone: ${process.env.SUPPORT_PHONE || '+1 234 567 8900'}
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                Thank you for choosing us for your travel adventure!
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-top: 30px;">
                Best regards,<br>
                <strong>The Romain Tribe Team</strong>
              </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated confirmation email. Please do not reply to this email.<br>
                © ${new Date().getFullYear()} Romain Tribe. All rights reserved.
              </p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error("User confirmation email error:", emailError);
      // Don't fail the request if user email fails
    }

    res.status(201).json({ 
      success: true,
      message: "Booking submitted successfully! Check your email for confirmation.",
      data: {
        id: booking._id,
        name: booking.name,
        email: booking.email,
        date: booking.date,
        reference: booking._id.toString().slice(-8).toUpperCase()
      }
    });

  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create booking"
    });
  }
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