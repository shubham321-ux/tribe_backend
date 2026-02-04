import express from "express";
import { createBooking } from "../controllers/booking.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { getAllBookings } from "../controllers/booking.controller.js";
import { updateBookingStatus } from "../controllers/booking.controller.js";
import { deleteBooking } from "../controllers/booking.controller.js";
const router = express.Router();

router.post("/", createBooking);

router.get(
  "/admin",
  protect,
//   checkPermission("BOOKINGS_VIEW"),
  getAllBookings
);

router.patch(
  "/admin/:id/status",
  protect,
//   checkPermission("BOOKINGS_MANAGE"),
  updateBookingStatus
);

router.delete(
  "/admin/:id",
  protect,
//   checkPermission("BOOKINGS_MANAGE"),
  deleteBooking
);

export default router;
