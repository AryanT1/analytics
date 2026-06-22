import type { Request, Response, NextFunction } from "express";
import redis from "../db/redis.js";

export const rateLimiter = (limit: number, windowSec: number) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const window = Math.floor(Date.now() / (windowSec * 1000));
        const key = `rate:${req.ip}:${window}`;
        const count = await redis.incr(key);
        if (count === 1) await redis.expire(key, windowSec);
        if (count > limit) {
            return res.status(429).json({ error: "Too many requests, slow down" });
        }
        next();
    };
};
