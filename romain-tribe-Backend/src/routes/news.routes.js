import express from "express";
import {
  createNews,
  getAllNews,
  getNewsBySlug,
  updateNews,
  deleteNews,
} from "../controllers/news.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import upload from "../utils/upload.js";

const router = express.Router();

// PUBLIC
router.get("/", getAllNews);
router.get("/:slug", getNewsBySlug);

// ADMIN
router.post("/", upload.single("image"), createNews);
router.put("/:id", protect, updateNews);
router.delete("/:id", protect, deleteNews);

export default router;
