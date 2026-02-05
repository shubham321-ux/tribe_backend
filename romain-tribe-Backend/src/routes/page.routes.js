import express from "express";
import { getPage, upsertPage } from "../controllers/page.controller.js";

const router = express.Router();


//   Get page content

router.get("/:slug", getPage);

// Create / Update page content

router.put("/:slug", upsertPage);

export default router;
