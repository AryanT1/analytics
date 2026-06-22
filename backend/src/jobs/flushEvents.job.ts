import { Queue } from "bullmq";
import { bullRedis } from "../db/redis.js";
import { Worker } from "bullmq";
import prisma from "../db/prisma.js";
import redis from "../db/redis.js"

const flushQueue= new Queue("flush-events", {connection: bullRedis})

export const flushEvents = async()=>{
    await flushQueue.add(
        "flush",
        {},
        { repeat: { every: 30000 } }
      )

}

const flushWorker = new Worker(
    "flush-events", async (job) => {
    const processingKey = `events:processing:${job.id}`;
    try {
        await redis.rename("events:buffer", processingKey);
    } catch {
        return; // buffer was empty or didn't exist
    }

    try {
        const content = await redis.lrange(processingKey, 0, -1);
        if (content.length === 0) {
            await redis.del(processingKey);
            return;
        }

        const parsedEvents = content.map((item) => JSON.parse(item));

        const resolved = await Promise.all(
            parsedEvents.map(async (event) => {
                if (!event.userId && event.anonymousId && event.projectId) {
                    const mapped = await redis.get(`identity:${event.projectId}:${event.anonymousId}`);
                    if (mapped) event.userId = mapped;
                }
                return event;
            })
        );

        await prisma.event.createMany({ data: resolved });
        await redis.del(processingKey);
    } catch (err: any) {
        console.error("Flush job failed:", err.message);
        // push failed events back to the front of the buffer so they aren't lost
        // (rename would overwrite any new events that arrived during this job)
        const items = await redis.lrange(processingKey, 0, -1).catch(() => [] as string[]);
        if (items.length > 0) {
            await redis.lpush("events:buffer", ...items.reverse()).catch(() => {});
        }
        await redis.del(processingKey).catch(() => {});
        throw err;
    }
    }, { connection: bullRedis }
)

