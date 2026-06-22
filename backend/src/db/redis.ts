import "../utils/config.js";
import { Redis } from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis };
const globalForBullRedis = globalThis as unknown as { bullRedis: Redis };


const createRedisClient = () => {
  return new Redis(process.env.REDIS_URL as string);
};

const redis = globalForRedis.redis || createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
export default redis;

const createBullRedisClient = () => {
  return new Redis(process.env.REDIS_URL as string, {
    maxRetriesPerRequest: null,
  });
};



const bullRedis = globalForBullRedis.bullRedis || createBullRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForBullRedis.bullRedis = bullRedis;
}

export { bullRedis };
