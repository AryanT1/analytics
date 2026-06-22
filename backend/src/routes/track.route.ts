import { Router } from "express";
import { track, identify } from "../controllers/track.controller.js";
import { ApiAuth } from "../middleware/apiAuth.middleware.js";
import { rateLimiter } from "../middleware/rateLimiter.middleware.js";

export const trackRouter = Router();

trackRouter.post("/", rateLimiter(100, 60), ApiAuth, track);
trackRouter.post("/identify", rateLimiter(20, 60), ApiAuth, identify);