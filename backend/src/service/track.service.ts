import redis from "../db/redis.js"
interface EventData {
    eventName: string;
    country?: string | undefined;
    deviceType?: string | undefined;
    properties?: unknown;
    userId?: string | null;
    anonymousId?: string | null;
    projectId: string;
  }
  
export const bufferEvent = async(data: EventData)=>{
           const event = {...data , createdAt: new Date()}
           const eventString = JSON.stringify(event)
           await redis.rpush("events:buffer", eventString)
}