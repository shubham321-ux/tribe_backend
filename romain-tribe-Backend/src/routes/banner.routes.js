import express from "express";
import upload from "../utils/upload.js";
import {
  createBanner,
  getAllBanners,
  getActiveBanners,
  getBanner,
  updateBanner,
  deleteBanner,
  incrementView,
  incrementClick,
  toggleBannerStatus,
  reorderBanners,
} from "../controllers/banner.controller.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveBanners); 
router.post("/:id/view", incrementView); 
router.post("/:id/click", incrementClick); 

// Admin routes (add auth middleware as needed)
router.get("/", getAllBanners); 
router.get("/:id", getBanner); 
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "mobileImage", maxCount: 1 },
  ]),
  createBanner
);
router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "mobileImage", maxCount: 1 },
  ]),
  updateBanner
);
router.delete("/:id", deleteBanner);
router.patch("/:id/toggle", toggleBannerStatus); 
router.post("/reorder", reorderBanners);

export default router;