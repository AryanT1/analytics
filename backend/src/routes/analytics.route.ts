import { Router } from "express";
import { GeneralAuth } from "../middleware/auth.middleware.js";
import { verifyProjectOwnership } from "../middleware/projectOwnerAuth.middleware.js";
import { getSummary, getEventsByName, getEventsOverTime, getUniqueUsersOverTime, getEventsByCountry, getEventsByDevice, getTopUsers } from "../controllers/analytics.controller.js";
import { rateLimiter } from "../middleware/rateLimiter.middleware.js";
import { cacheResponse } from "../middleware/cache.middleware.js";


export const analyticsRouter = Router();

analyticsRouter.get("/:projectId/summary",      rateLimiter(30, 60), GeneralAuth, verifyProjectOwnership, cacheResponse(60), getSummary)
analyticsRouter.get("/:projectId/events",        rateLimiter(30, 60), GeneralAuth, verifyProjectOwnership, cacheResponse(60), getEventsByName)
analyticsRouter.get("/:projectId/overtime",      rateLimiter(30, 60), GeneralAuth, verifyProjectOwnership, cacheResponse(60), getEventsOverTime)
analyticsRouter.get("/:projectId/users-overtime",rateLimiter(30, 60), GeneralAuth, verifyProjectOwnership, cacheResponse(60), getUniqueUsersOverTime)
analyticsRouter.get("/:projectId/countries",     rateLimiter(30, 60), GeneralAuth, verifyProjectOwnership, cacheResponse(60), getEventsByCountry)
analyticsRouter.get("/:projectId/devices",       rateLimiter(30, 60), GeneralAuth, verifyProjectOwnership, cacheResponse(60), getEventsByDevice)
analyticsRouter.get("/:projectId/users",         rateLimiter(30, 60), GeneralAuth, verifyProjectOwnership, cacheResponse(60), getTopUsers)