import express from "express";
import upload from "../utils/upload.js";
import { protect } from "../middlewares/auth.middleware.js";
// import { } from "../middlewares/admin.middleware.js";
import {
  createTrip,
  getTrips,
  updateTrip,
  deleteTrip
} from "../controllers/trip.controller.js";

const router = express.Router();

router.get("/", getTrips);
router.post("/", protect,  upload.array("images", 6), createTrip);
router.put("/:id", protect,  updateTrip);
router.delete("/:id", protect,  deleteTrip);

export default router;
