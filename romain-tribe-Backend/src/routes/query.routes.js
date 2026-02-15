import express from "express";
import {
  createQuery,
  getAllQueries,
  getQuery,
  updateQueryStatus,
  deleteQuery,
  getQueryStats,
} from "../controllers/query.controller.js";
// import { protect, adminOnly } from "../middleware/auth.js"; // Add your auth middleware

const router = express.Router();

// Public route - Contact form submission
router.post("/", createQuery);

// Admin routes (add authentication middleware as needed)
router.get("/", getAllQueries); // protect, adminOnly
router.get("/stats", getQueryStats); // protect, adminOnly
router.get("/:id", getQuery); // protect, adminOnly
router.patch("/:id/status", updateQueryStatus); // protect, adminOnly
router.delete("/:id", deleteQuery); // protect, adminOnly

export default router;