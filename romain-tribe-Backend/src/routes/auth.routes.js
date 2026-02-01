import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

import authRoutes from "./src/routes/auth.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
