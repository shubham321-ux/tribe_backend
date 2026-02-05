import express from "express";
import {
  getContent,
  upsertContent,
} from "../controllers/content.controller.js";

const router = express.Router();

/**
 * Get site-wide content
 */
router.get("/", getContent);

/**
 * Create / Update site-wide content (admin)
 */
router.put("/", upsertContent);

export default router;
