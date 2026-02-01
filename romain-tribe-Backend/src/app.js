import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";

import tripRoutes from "./routes/trip.routes.js";
import bookingRoutes from "./routes/booking.routes.js"
import authRoutes from "./routes/auth.routes.js"

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(compression());

app.use("/api/trips", tripRoutes);
app.use("/api/bookings",bookingRoutes)
app.use("/api/auth",authRoutes)

export default app;
