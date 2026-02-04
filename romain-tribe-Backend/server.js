import dotenv from "dotenv";
dotenv.config(); // MUST be first

import cluster from "cluster";
import os from "os";
import express from "express";
import compression from "compression";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

const PORT = process.env.PORT || 5000;
const CPU_COUNT = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`🧠 Primary process ${process.pid}`);
  console.log(`⚡ Starting ${CPU_COUNT} workers`);

  // Fork workers
  for (let i = 0; i < CPU_COUNT; i++) {
    cluster.fork();
  }

  // Auto-restart if a worker dies
  cluster.on("exit", (worker) => {
    console.log(`❌ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

} else {
  // ---------------- WORKER PROCESS ----------------

  const startServer = async () => {
    try {
      console.log(`🔌 Worker ${process.pid} connecting to DB...`);
      await connectDB();

      // Performance middlewares
      app.use(compression());
      app.use(express.json({ limit: "10kb" }));
      app.disable("x-powered-by");

      app.listen(PORT, () => {
        console.log(`🚀 Worker ${process.pid} running on port ${PORT}`);
      });

    } catch (error) {
      console.error("❌ Server startup failed:", error.message);
      process.exit(1);
    }
  };

  startServer();
}
