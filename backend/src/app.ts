import "./utils/config.js";
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.route.js";
import { authRouter } from "./routes/auth.route.js";
import { trackRouter } from "./routes/track.route.js";
import { projectRouter } from "./routes/project.route.js";
import { analyticsRouter } from "./routes/analytics.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/track", trackRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/analytics", analyticsRouter);

export default app;
