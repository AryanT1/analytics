import type { Request, Response, NextFunction } from "express";
import prisma from "../db/prisma.js";
import redis from "../db/redis.js";

export interface ApiKeyRequest extends Request{
    project?: {
        id:string;
        userId: string;
    }
}

export const ApiAuth = async (
  req: ApiKeyRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;
    if (!apiKey) {
      return res.status(401).json({ error: "API key missing" });
    }

    const cacheKey = `apikey:${apiKey}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      req.project = JSON.parse(cached);
      return next();
    }

    const project = await prisma.project.findUnique({ where: { apiKey }, select: { id: true, userId: true } });
    if (!project) {
      return res.status(401).json({ error: "Authentication error" });
    }

    await redis.set(cacheKey, JSON.stringify({ id: project.id, userId: project.userId }), "EX", 300);
    req.project = { id: project.id, userId: project.userId };
    next();
  } catch (err: any) {
    console.error("Error in ApiAuth middleware:", err.message);
    return res.status(403).json({ error: "Invalid or expired API key" });
  }
};