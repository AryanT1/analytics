import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middleware.js";
import redis from "../db/redis.js";

export const cacheResponse = (ttlSec: number) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        const key = `cache:${req.params.projectId}:${req.path}:${JSON.stringify(req.query)}`;

        const cached = await redis.get(key);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }

        const originalJson = res.json.bind(res);
        res.json = (body: any) => {
            if (res.statusCode === 200) {
                redis.set(key, JSON.stringify(body), "EX", ttlSec).catch(() => {});
            }
            return originalJson(body);
        };

        next();
    };
};
