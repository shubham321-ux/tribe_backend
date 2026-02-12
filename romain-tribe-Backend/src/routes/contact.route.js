import express from "express";
import { getContact, updateContact } from "../controllers/contact.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// PUBLIC
router.get("/", getContact);

// ADMIN
router.put("/", protect, updateContact);

export default router;