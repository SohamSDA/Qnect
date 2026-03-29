import express from "express";
import cors from "cors"; // [ADDED] Import cors
import healthRouter from "./routes/health.js";
import apiRouter from "./routes/index.js";
import { env } from "./config/env.js";

const app = express();

const allowedOrigins = env.FRONTEND_URL.split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

// This allows your frontend (port 3000) to talk to this backend
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // Allow cookies/tokens if needed
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

// basic middleware
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Main routes
app.use("/api", apiRouter);
app.use("/health", healthRouter);

export default app;
