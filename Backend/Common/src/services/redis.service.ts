import { RedisClientType } from "redis";

export class RedisService {
   constructor(private client: RedisClientType) {}

   async get(key: string): Promise<string | null> {
      return await this.client.get(key);
   }

   async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
      if (ttlSeconds) {
         await this.client.setEx(key, ttlSeconds, value);
      } else {
         await this.client.set(key, value);
      }
   }

   async del(key: string): Promise<void> {
      await this.client.del(key);
   }
}
