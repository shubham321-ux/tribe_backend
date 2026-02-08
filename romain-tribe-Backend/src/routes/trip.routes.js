import express from "express";
import upload from "../utils/upload.js";
import {
  createTrip,
  getTrips,
  updateTrip,
  deleteTrip
} from "../controllers/trip.controller.js";

const router = express.Router();

router.get("/", getTrips);

router.post(
  "/",
  upload.fields([
    { name: "attachments", maxCount: 5 },
    { name: "images", maxCount: 10 },
    
  ]),
   (req,res,next)=>{
    console.log("this body",req.body)
     next()},
  createTrip
);

router.put(
  "/:id",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "attachments", maxCount: 5 }
  ]),
  updateTrip
);

router.delete("/:id", deleteTrip);

export default router;
