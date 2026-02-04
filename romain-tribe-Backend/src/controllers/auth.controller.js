import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

/*  TOKEN  */
const generateToken = (res, admin) => {
  const token = jwt.sign(
    { id: admin._id, role: admin.role, permissions: admin.permissions },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

/*  LOGIN  */
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (!admin || !admin.isActive) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  generateToken(res, admin);

  res.status(200).json({
    success: true,
    data: {
      id: admin._id,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
    },
  });
};

/*  CREATE SUB ADMIN  */
export const createSubAdmin = async (req, res) => {
  const { name, email, password, permissions } = req.body;

  const exists = await Admin.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "Admin already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const subAdmin = await Admin.create({
    name,
    email,
    password: hashedPassword,
    role: "SUB_ADMIN",
    permissions,
  });

  res.status(201).json({
    success: true,
    message: "Sub-admin created successfully",
    data: {
      id: subAdmin._id,
      name: subAdmin.name,
      email: subAdmin.email,
      permissions: subAdmin.permissions,
    },
  });
};

/*  LOGOUT  */
export const logoutAdmin = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

/*  CURRENT USER  */
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });



};

  /* CREATE FIRST ADMIN */
export const createAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  // check if admin already exists
  const exists = await Admin.findOne({ role: "ADMIN" });
  if (exists) {
    return res.status(400).json({
      message: "Admin already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await Admin.create({
    name,
    email,
    password: hashedPassword,
    role: "ADMIN",
    permissions: [
      "USERS_MANAGE",
      "BOOKINGS_VIEW",
      "BOOKINGS_MANAGE",
      "TRIPS_MANAGE"
    ],
  });

  res.status(201).json({
    success: true,
    message: "Admin created successfully",
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
    },
  });
};
