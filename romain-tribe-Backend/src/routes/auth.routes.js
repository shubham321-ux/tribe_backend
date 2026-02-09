import express from "express";
import {
  loginAdmin,
  logoutAdmin,
  createSubAdmin,
  getMe,
  createAdmin,
  verifyToken
} from "../controllers/auth.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/permission.middleware.js";

const router = express.Router();

/* PUBLIC */
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/verify", verifyToken);

/* ADMIN */
router.get("/me", protect, getMe);

// create admin 
router.post("/create-admin", createAdmin);

router.post(
  "/create-sub-admin",
  protect,
  checkPermission("USERS_MANAGE"),
  createSubAdmin
);

export default router;
