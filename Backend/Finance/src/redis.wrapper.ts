import { createClient, RedisClientType } from 'redis';
import { Exception } from "@inv2/common";

class RedisWrapper {
   private cxn!: RedisClientType;
   async connect(url: string): Promise<void> {
      console.log(`Trying to connect to Redis`, url);
      // Create a `node-redis` client
      this.cxn = createClient({
         url,
         socket: {
            reconnectStrategy: retries => Math.min(retries * 50, 1000)
         }
      });
      // // Then connect to the Redis server
      await this.cxn.connect();
      console.log(`Connected to Redis Server`);
   }
   get client() {
      if(!this.cxn) throw new Exception({code: 500, message: 'Connect to Redis before getting connection'});
      return this.cxn;
   }
}

export const redisWrapper = new RedisWrapper;