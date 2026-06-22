import { Router } from "express";
import { login, signup } from "../controllers/auth.controller.js";
import { rateLimiter } from "../middleware/rateLimiter.middleware.js";

export const authRouter = Router();

authRouter.post("/signup", rateLimiter(10, 60), signup);
authRouter.post("/login", rateLimiter(10, 60), login);