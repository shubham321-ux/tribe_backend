import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

export const protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Account disabled" });
    }

    req.user = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
