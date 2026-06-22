import prisma from "../db/prisma.js";
import type { Request ,Response  } from "express";
import redis from "../db/redis.js";

export const health = async(req: Request , res: Response) =>{
  const start = Date.now();
  try {
    const uptime = `${process.uptime().toFixed(2)} s`;
    const memoryused = process.memoryUsage();
    const memory = `${(memoryused.heapUsed / 1024 / 1024).toFixed(2)} MB`;
    let dbStatus = "disconnected";
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";

    let redisStatus = 'disconnected'
    await redis.ping()
    redisStatus = 'connected'

    const responseTime = `${(Date.now() - start).toFixed()} ms `;
    res
      .status(200)
      .json({
        dbStatus,
        redisStatus ,
        uptime,
        memory,
        status: "ok",
        responseTime,
      });
  } catch (err:any) {
    console.error(err)
    res.status(500).json({ error: "something went wrong"  });
  }
}