import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import cors from "cors"
import { fileURLToPath } from "url";

import tripRoutes from "./routes/trip.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import authRoutes from "./routes/auth.routes.js";
import seoRoutes from "./routes/seo.routes.js";
import pageRoutes from "./routes/page.routes.js";
import contentRoutes from "./routes/content.routes.js";
import newsRoutes from "./routes/news.routes.js"
import bannerRoutes from "./routes/banner.routes.js";
import contactRoutes from "./routes/contact.route.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("dir>.>>>>>>",__dirname)

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map(origin => origin.trim())
  : [];

const app = express();


app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));


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
app.use("/api/news",newsRoutes)
app.use("/api/banners", bannerRoutes);
app.use("/api/contact",contactRoutes)

/*  FRONTEND  */
const frontendPath = path.join(__dirname, "..","..", "romain-tribe-Frontend", "dist");
console.log("this is path",frontendPath)

const frontendPathAdmin = path.join(__dirname, "..","..", "romain-tribe-AdminPanel", "build");
console.log("this is path admin",frontendPathAdmin)


app.use("/", express.static(frontendPath));
app.use("/admin", express.static(frontendPathAdmin));

/* ADMIN SPA FALLBACK */
app.get(/^\/admin(\/.*)?$/, (req, res) => {
  res.sendFile(path.join(frontendPathAdmin, "index.html"));
});

/* USER SPA FALLBACK (LAST) */
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});


export default app;
