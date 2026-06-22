import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import prisma from "../db/prisma.js";
import redis from "../db/redis.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const GeneralAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Unauthorized - No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT secret is not defined in environment variables.");
      return res.status(500).json({ error: "Internal Server Error" });
    }
    const decoded = jwt.verify(token!, secret) as JwtPayload;
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: "Unauthorized - Invalid token" });
    }

    const cacheKey = `user:${decoded.userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      req.user = JSON.parse(cached);
      return next();
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await redis.set(cacheKey, JSON.stringify({ id: user.id }), "EX", 300);
    req.user = { id: user.id };
    next();
  } catch (error: any) {
    console.error("Error in verifyToken middleware:", error.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
