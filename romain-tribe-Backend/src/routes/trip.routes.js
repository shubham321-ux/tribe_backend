import express from "express";
import upload from "../utils/upload.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  createTrip,
  getTrips,
  updateTrip,
  deleteTrip
} from "../controllers/trip.controller.js";

const router = express.Router();

router.get("/", getTrips);
router.post("/", verifyUser, isAdmin, upload.array("images", 6), createTrip);
router.put("/:id", verifyUser, isAdmin, updateTrip);
router.delete("/:id", verifyUser, isAdmin, deleteTrip);

export default router;
