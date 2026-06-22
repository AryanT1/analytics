
import z from "zod";
import type { Response } from "express";
import type { ApiKeyRequest } from "../middleware/apiAuth.middleware.js";
import { bufferEvent } from "../service/track.service.js";
import prisma from "../db/prisma.js";
import redis from "../db/redis.js";

const Schema = z.object({
  eventName: z.string().min(1),
  userId: z.string().optional(),
  anonymousId: z.string().optional(),
  country: z.string().optional(),
  deviceType: z.string().optional(),
  properties: z.unknown().optional(),
});

const IdentifySchema = z.object({
  anonymousId: z.string().min(1),
  userId: z.string().min(1),
});


export const track = async (req: ApiKeyRequest, res: Response) => {
  try {
    if (!req.project) {
      return res.status(401).json({
        error: "Invalid or missing API key",
      });
    }
    const projectId = req.project?.id;
    const parasafe = Schema.safeParse(req.body);

    if (!parasafe.success) {
      return res.status(400).json({ err: "validation err" });
    }
    const { eventName, userId = null, anonymousId = null, country, deviceType, properties } = parasafe.data;
    await bufferEvent({ eventName, country, deviceType, properties, userId, anonymousId, projectId })

  
    res.status(200).json({success: true, message: "Event received" })
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).json({ error: "internal server error in track" });
  }
};

export const identify = async (req: ApiKeyRequest, res: Response) => {
  try {
    if (!req.project) {
      return res.status(401).json({ error: "Invalid or missing API key" });
    }

    const parsed = IdentifySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "anonymousId and userId are required" });
    }

    const { anonymousId, userId } = parsed.data;
    const projectId = req.project.id;

    await Promise.all([
      // patch already-flushed events in Postgres
      prisma.event.updateMany({
        where: { projectId, anonymousId, userId: null },
        data: { userId },
      }),
      // store mapping so the flush job can patch still-buffered events
      redis.set(`identity:${projectId}:${anonymousId}`, userId, "EX", 60 * 60 * 24 * 7),
    ]);

    return res.status(200).json({ success: true, message: "Identity merged" });
  } catch (err: any) {
    console.error(err.message);
    return res.status(500).json({ error: "Internal server error in identify" });
  }
};
