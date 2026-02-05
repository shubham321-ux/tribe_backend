import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

import tripRoutes from "./routes/trip.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import authRoutes from "./routes/auth.routes.js";
import seoRoutes from "./routes/seo.routes.js";
import pageRoutes from "./routes/page.routes.js";
import contentRoutes from "./routes/content.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(compression());

/*  API ROUTES  */
app.use("/api/trips", tripRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/content", contentRoutes);

/*  FRONTEND  */
const frontendPath = path.join(__dirname, "..","..", "romain-tribe-Frontend", "dist");
console.log("this is path",frontendPath)

app.use(express.static(frontendPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});


export default app;
