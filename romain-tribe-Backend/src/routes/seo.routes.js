import express from "express";
import { getSeo, updateSeo } from "../controllers/seo.controller.js";

const router = express.Router();


router.get("/:page", getSeo);

router.put("/:page", updateSeo);

export default router;
