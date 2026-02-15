import Query from "../models/query.model.js";
import { transporter } from "../config/mail.js";

/**
 * CREATE QUERY (Public - Contact Form Submission)
 */
export const createQuery = async (req, res) => {
  try {
    const { name, email, phone, message, subject } = req.body;

    // Get IP address
    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // Create query
    const query = await Query.create({
      name,
      email,
      phone,
      message,
      subject,
      ipAddress,
    });

    // Send email notification to admin
    try {
      await transporter.sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: `New Query: ${subject || "Contact Form Submission"}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
              New Contact Query Received
            </h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0;"><strong>Phone:</strong> ${phone}</p>
              ${subject ? `<p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>` : ""}
            </div>
            
            <div style="background: white; padding: 20px; border-left: 4px solid #3498db; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Message:</h3>
              <p style="color: #666; line-height: 1.6;">${message}</p>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Submitted at: ${new Date().toLocaleString()}<br>
              IP Address: ${ipAddress}
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email notification error:", emailError);
      // Don't fail the request if email fails
    }

    // Send auto-reply to user
    try {
      await transporter.sendMail({
        to: email,
        subject: "We received your message - Thank you for contacting us!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3498db;">Thank You for Reaching Out!</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Dear ${name},
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              We have received your message and will get back to you as soon as possible. 
              Our team typically responds within 24-48 hours.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Your Message:</h3>
              <p style="color: #666;">${message}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              If you need immediate assistance, please call us at ${process.env.SUPPORT_PHONE || "our support number"}.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Best regards,<br>
              <strong>Support Team</strong>
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Auto-reply error:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Query submitted successfully. We'll get back to you soon!",
      data: {
        id: query._id,
        name: query.name,
        email: query.email,
        createdAt: query.createdAt,
      },
    });
  } catch (error) {
    console.error("Create query error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit query",
    });
  }
};

/**
 * GET ALL QUERIES (Admin)
 */
export const getAllQueries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      startDate,
      endDate,
    } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Execute query
    const [queries, total] = await Promise.all([
      Query.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Query.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: queries,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get queries error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch queries",
    });
  }
};

/**
 * GET SINGLE QUERY (Admin)
 */
export const getQuery = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    res.status(200).json({
      success: true,
      data: query,
    });
  } catch (error) {
    console.error("Get query error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch query",
    });
  }
};

/**
 * UPDATE QUERY STATUS (Admin)
 */
export const updateQueryStatus = async (req, res) => {
  try {
    const { status, priority, adminNotes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (adminNotes) updateData.adminNotes = adminNotes;

    // Mark as responded if status is resolved
    if (status === "RESOLVED" || status === "CLOSED") {
      updateData.respondedAt = new Date();
    }

    const query = await Query.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Query updated successfully",
      data: query,
    });
  } catch (error) {
    console.error("Update query error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update query",
    });
  }
};

/**
 * DELETE QUERY (Admin)
 */
export const deleteQuery = async (req, res) => {
  try {
    const query = await Query.findByIdAndDelete(req.params.id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Query deleted successfully",
    });
  } catch (error) {
    console.error("Delete query error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete query",
    });
  }
};

/**
 * GET QUERY STATISTICS (Admin Dashboard)
 */
export const getQueryStats = async (req, res) => {
  try {
    const [total, pending, inProgress, resolved, byPriority] =
      await Promise.all([
        Query.countDocuments(),
        Query.countDocuments({ status: "PENDING" }),
        Query.countDocuments({ status: "IN_PROGRESS" }),
        Query.countDocuments({ status: "RESOLVED" }),
        Query.aggregate([
          {
            $group: {
              _id: "$priority",
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    // Get recent queries
    const recentQueries = await Query.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email subject status createdAt")
      .lean();

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total,
          pending,
          inProgress,
          resolved,
          closed: total - pending - inProgress - resolved,
        },
        byPriority: byPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentQueries,
      },
    });
  } catch (error) {
    console.error("Get query stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch query statistics",
    });
  }
};